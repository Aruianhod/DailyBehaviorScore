const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 数据库连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456', // 请根据实际情况修改
  database: 'score_system'
});

db.connect(err => {
  if (err) throw err;
  console.log('数据库连接成功');
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username=? AND password=?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ message: '数据库错误' });
      if (results.length > 0) {
        // 返回用户类型
        res.json({ token: 'mock-token', userType: results[0].user_type });
      } else {
        res.status(401).json({ message: '用户名或密码错误' });
      }
    }
  );
});

// 学生信息导入（直接输入）
app.post('/api/admin/import', (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students)) return res.status(400).json({ message: '数据格式错误' });
  // 先插入users表
  const userValues = students.map(s => [s.id, s.id, 'student', s.name]);
  db.query('INSERT IGNORE INTO users (username, password, user_type, name) VALUES ?', [userValues], err => {
    if (err) return res.status(500).json({ message: '数据库错误(users)' });
    // 再插入students表
    // 兼容 grade/class 字段
    const stuValues = students.map(s => [s.id, s.name, s.grade || '', s.class || '', 100]);
    db.query('INSERT IGNORE INTO students (student_id, name, grade, class, score) VALUES ?', [stuValues], err2 => {
      if (err2) return res.status(500).json({ message: '数据库错误(students)' });
      res.json({ message: '导入成功', students });
    });
  });
});

// Excel 导入
app.post('/api/admin/import-excel', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '未上传文件' });
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const students = [];
    for (const row of rows) {
      // 期望格式：年级 班级 学号 姓名
      if (row[0] && row[1] && row[2] && row[3] && /^\d{4}$/.test(row[0]) && /^\d+$/.test(row[1]) && /^\d{10}$/.test(row[2]) && row[3]) {
        students.push({ grade: String(row[0]), class: String(row[1]), id: String(row[2]), name: String(row[3]) });
      }
    }
    if (students.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: '无有效数据' });
    }
    // 先插入users表
    const userValues = students.map(s => [s.id, s.id, 'student', s.name]);
    db.query('INSERT IGNORE INTO users (username, password, user_type, name) VALUES ?', [userValues], err => {
      if (err) { fs.unlinkSync(req.file.path); return res.status(500).json({ message: '数据库错误(users)' }); }
      // 再插入students表
      const stuValues = students.map(s => [s.id, s.name, s.grade || '', s.class || '', 100]);
      db.query('INSERT IGNORE INTO students (student_id, name, grade, class, score) VALUES ?', [stuValues], err2 => {
        fs.unlinkSync(req.file.path);
        if (err2) return res.status(500).json({ message: '数据库错误(students)' });
        res.json({ message: '导入成功', students });
      });
    });
  } catch (e) {
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    console.error('Excel导入异常:', e);
    res.status(500).json({ message: '文件解析失败' });
  }
});

// 学生列表（支持筛选）
app.get('/api/admin/students', (req, res) => {
  const { grade, class: className } = req.query;
  let query = 'SELECT student_id, name, grade, class, score FROM students';
  let params = [];
  let whereConditions = [];

  if (grade) {
    whereConditions.push('grade = ?');
    params.push(grade);
  }
  
  if (className) {
    whereConditions.push('class = ?');
    params.push(className);
  }

  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  query += ' ORDER BY grade, class, student_id';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: '数据库错误' });
    res.json({ students: results });
  });
});

// 获取年级班级选项
app.get('/api/admin/class-options', (req, res) => {
  const { grade } = req.query;
  
  const gradeQuery = 'SELECT DISTINCT grade FROM students WHERE grade IS NOT NULL AND grade != "" ORDER BY grade';
  
  db.query(gradeQuery, (err1, gradeResults) => {
    if (err1) return res.status(500).json({ message: '获取年级数据失败' });
    
    let classQuery = 'SELECT DISTINCT class FROM students WHERE class IS NOT NULL AND class != ""';
    let classParams = [];
    
    // 如果指定了年级，筛选对应的班级（班级前两位对应年级后两位）
    if (grade) {
      const gradeStr = grade.toString();
      const gradeLastTwo = gradeStr.slice(-2); // 获取年级的后两位
      classQuery += ' AND class LIKE ?';
      classParams.push(`${gradeLastTwo}%`);
    }
    
    classQuery += ' ORDER BY class';
    
    db.query(classQuery, classParams, (err2, classResults) => {
      if (err2) return res.status(500).json({ message: '获取班级数据失败' });
      
      const grades = gradeResults.map(row => row.grade);
      const classes = classResults.map(row => row.class);
      
      res.json({ grades, classes });
    });
  });
});

// 删除学生接口
app.delete('/api/admin/students', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: '参数错误' });
  // 先删分值记录
  db.query('DELETE FROM score_records WHERE student_id IN (?)', [ids], err1 => {
    if (err1) return res.status(500).json({ message: '删除失败(score_records)' });
    db.query('DELETE FROM students WHERE student_id IN (?)', [ids], err2 => {
      if (err2) return res.status(500).json({ message: '删除失败(students)' });
      db.query('DELETE FROM users WHERE username IN (?)', [ids], err3 => {
        if (err3) return res.status(500).json({ message: '用户删除失败' });
        res.json({ message: '删除成功' });
      });
    });
  });
});

// 批量分值修改接口（兼容单个和多个）
app.post('/api/admin/score', (req, res) => {
  let { student_id, delta, reason, operator } = req.body;
  if (!reason || typeof delta !== 'number' || !operator) return res.status(400).json({ message: '参数错误' });
  if (!Array.isArray(student_id)) student_id = [student_id];
  let finished = 0, failed = 0;
  student_id.forEach(id => {
    db.query('UPDATE students SET score = score + ? WHERE student_id = ?', [delta, id], err => {
      if (err) { failed++; check(); return; }
      db.query('INSERT INTO score_records (student_id, operator, reason, delta) VALUES (?, ?, ?, ?)', [id, operator, reason, delta], err2 => {
        if (err2) { failed++; }
        check();
      });
    });
  });
  function check() {
    finished++;
    if (finished === student_id.length) {
      if (failed) return res.json({ message: `部分失败，成功${student_id.length - failed}，失败${failed}` });
      res.json({ message: '分值批量修改成功' });
    }
  }
});

// 查询学生分值变动记录
app.get('/api/admin/score-records/:student_id', (req, res) => {
  const { student_id } = req.params;
  db.query('SELECT * FROM score_records WHERE student_id = ? ORDER BY created_at DESC', [student_id], (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    
    // 统一格式化数据
    const formattedRecords = results.map(record => ({
      id: record.id,
      student_id: record.student_id,
      delta: record.delta,
      reason: record.reason,
      created_at: record.created_at,
      date: record.created_at, // 统一时间字段
      operator: record.operator === 'admin' ? '管理员' : (record.operator || '系统')
    }));
    
    res.json({ records: formattedRecords });
  });
});

// 老师提交分值修改申请（支持多人一条）
app.post('/api/teacher/apply', (req, res) => {
  const { students, delta, reason, date, teacher } = req.body;
  if (!Array.isArray(students) || !students.length || !reason || typeof delta !== 'number' || !date) {
    return res.status(400).json({ message: '参数不完整' });
  }
  const student_ids = students.map(s => s.id);
  const student_names = students.map(s => s.name);
  const teacherName = teacher || 'teacher1'; // 默认老师名
  db.query(
    'INSERT INTO score_applications (student_ids, student_names, delta, reason, date, status, teacher) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [JSON.stringify(student_ids), JSON.stringify(student_names), delta, reason, date, 'pending', teacherName],
    (err) => {
      if (err) return res.status(500).json({ message: '申请提交失败' });
      res.json({ message: '申请已提交，等待管理员审核' });
    }
  );
});

// 获取待审核申请列表
app.get('/api/admin/applications', (req, res) => {
  db.query('SELECT * FROM score_applications WHERE status = "pending" ORDER BY created_at ASC', (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    // 解析student_ids/names
    results.forEach(r => {
      try {
        r.student_ids = JSON.parse(r.student_ids || '[]');
        r.student_names = JSON.parse(r.student_names || '[]');
      } catch {}
    });
    res.json({ applications: results });
  });
});

// 审核通过（批量处理所有学生）
app.post('/api/admin/applications/:id/approve', (req, res) => {
  const id = req.params.id;
  console.log('开始审核申请:', id);
  
  db.query('SELECT * FROM score_applications WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('查询申请失败:', err);
      return res.status(404).json({ message: '查询申请失败: ' + err.message });
    }
    if (results.length === 0) {
      console.log('申请不存在:', id);
      return res.status(404).json({ message: '申请不存在' });
    }
    
    const app = results[0];
    console.log('找到申请:', app);
    
    let ids = [];
    try { 
      ids = JSON.parse(app.student_ids || '[]'); 
    } catch (e) { 
      console.log('解析student_ids失败，使用备用方案');
      ids = app.student_id ? [app.student_id] : []; 
    }
    
    console.log('学生IDs:', ids);
    if (!ids.length) return res.status(400).json({ message: '无学生信息' });
    
    let finished = 0, failed = 0;
    ids.forEach(sid => {
      console.log('更新学生分数:', sid, '增加:', app.delta);
      db.query('UPDATE students SET score = score + ? WHERE student_id = ?', [app.delta, sid], err2 => {
        if (err2) { 
          console.error('更新学生分数失败:', err2);
          failed++; 
          check(); 
          return; 
        }
        
        console.log('插入分数记录:', sid);
        db.query('INSERT INTO score_records (student_id, operator, reason, delta, created_at) VALUES (?, ?, ?, ?, ?)',
          [sid, '管理员', app.reason, app.delta, app.date], err3 => {
          if (err3) { 
            console.error('插入分数记录失败:', err3);
            failed++; 
          }
          check();
        });
      });
    });
    
    function check() {
      finished++;
      console.log('完成进度:', finished, '/', ids.length, '失败:', failed);
      if (finished === ids.length) {
        console.log('开始更新申请状态为已通过');        db.query('UPDATE score_applications SET status = "approved" WHERE id = ?', [id], err4 => {
          if (err4) {
            console.error('更新申请状态失败:', err4);
            return res.status(500).json({ message: '更新申请状态失败: ' + err4.message });
          }
          console.log('审核完成，成功');
          if (failed) return res.json({ message: `部分失败，成功${ids.length - failed}，失败${failed}` });
          res.json({ message: '审核通过并已完成分值变动' });
        });
      }
    }
  });
});

// 审核驳回
app.post('/api/admin/applications/:id/reject', (req, res) => {
  const id = req.params.id;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: '请填写驳回理由' });
  
  // 查找申请
  db.query('SELECT * FROM score_applications WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: '申请不存在' });
    
    const app = results[0];
      // 更新申请状态为已驳回，并在reason字段中添加驳回理由
    db.query('UPDATE score_applications SET status = "rejected", reason = CONCAT(reason, "（驳回理由：", ? ,"）") WHERE id = ?', [reason, id], err2 => {
      if (err2) return res.status(500).json({ message: '更新申请状态失败' });
      
      // 发送通知给老师
      const teacher = app.teacher || 'teacher1';
      let studentInfo = '';
      
      try {
        const studentIds = JSON.parse(app.student_ids || '[]');
        const studentNames = JSON.parse(app.student_names || '[]');
        if (studentIds.length > 0 && studentNames.length > 0) {
          studentInfo = `${studentIds[0]}（${studentNames[0]}）`;
          if (studentIds.length > 1) {
            studentInfo += ` 等${studentIds.length}名学生`;
          }
        } else {
          studentInfo = `${app.student_id || ''}（${app.student_name || ''}）`;
        }
      } catch {
        studentInfo = `${app.student_id || ''}（${app.student_name || ''}）`;
      }
      
      db.query('INSERT INTO notifications (user, content) VALUES (?, ?)',
        [teacher, `你提交的学生${studentInfo}分值申请被驳回，理由：${reason}`], err4 => {
        if (err4) return res.status(500).json({ message: '通知发送失败' });
        res.json({ message: '已驳回并通知老师' });
      });
    });
  });
});

// 老师端获取通知
app.get('/api/teacher/notifications', (req, res) => {
  const user = req.query.user;
  if (!user) return res.status(400).json({ message: '参数错误' });
  db.query('SELECT * FROM notifications WHERE user = ? ORDER BY created_at DESC', [user], (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    res.json({ notifications: results });
  });
});

// 老师端历史提交记录
app.get('/api/teacher/applications/history', (req, res) => {
  const teacher = req.query.user ;
  db.query('SELECT * FROM score_applications WHERE teacher = ? ORDER BY created_at DESC', [teacher], (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    // 解析学生信息
    results.forEach(r => {
      try {
        r.student_ids = JSON.parse(r.student_ids || '[]');
        r.student_names = JSON.parse(r.student_names || '[]');
      } catch {}
      // 状态映射
      if (r.status === 'pending') r.status = '待审核';
      if (r.status === 'approved') r.status = '已通过';
      if (r.status === 'rejected') r.status = '已驳回';
      // 处理人、处理时间、驳回理由 - 统一字段名
      r.reviewer = r.status !== '待审核' ? '管理员' : '';
      r.reviewed_at = r.status !== '待审核' ? (r.updated_at || r.created_at) : '';
      // 统一时间字段
      r.date = r.created_at;
      // 驳回理由兼容
      if (r.status === '已驳回' && r.reason && r.reason.includes('驳回理由：')) {
        const match = r.reason.match(/驳回理由：(.+?)）/);
        r.reject_reason = match ? match[1] : '';
      }
    });
    // 拆分为单条记录（每个学生一条）
    const applications = [];
    results.forEach(r => {
      const ids = Array.isArray(r.student_ids) ? r.student_ids : [r.student_id];
      const names = Array.isArray(r.student_names) ? r.student_names : [r.student_name];
      ids.forEach((sid, idx) => {
        applications.push({
          id: r.id,
          student_id: sid,
          student_name: names[idx] || '',
          delta: r.delta,
          reason: r.reason,
          date: r.date, // 统一使用date
          status: r.status,
          reviewer: r.reviewer,
          reviewed_at: r.reviewed_at,
          reject_reason: r.reject_reason
        });
      });
    });    res.json({ applications });
  });
});

// 学生端API - 获取学生信息
app.get('/api/student/info', (req, res) => {
  const studentId = req.query.studentId;
  if (!studentId) return res.status(400).json({ message: '学号参数缺失' });
  
  db.query('SELECT * FROM students WHERE student_id = ?', [studentId], (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    if (results.length === 0) return res.status(404).json({ message: '未找到学生信息' });
    
    const student = results[0];
    res.json({ 
      student: {
        id: student.student_id,
        name: student.name,
        grade: student.grade,
        class: student.class,
        score: student.score || 80 // 默认分值
      }
    });
  });
});

// 学生端API - 获取分值变更记录
app.get('/api/student/score-records', (req, res) => {
  const studentId = req.query.student_id || req.query.studentId;
  if (!studentId) return res.status(400).json({ message: '学号参数缺失' });
  
  db.query('SELECT * FROM score_records WHERE student_id = ? ORDER BY created_at DESC', [studentId], (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    
    // 统一格式化数据
    const formattedRecords = results.map(record => ({
      id: record.id,
      student_id: record.student_id,
      delta: record.delta,
      reason: record.reason,
      date: record.created_at, // 统一使用date字段
      reviewer: record.operator === 'admin' ? '管理员' : (record.operator || '系统'), // 统一使用reviewer字段
      created_at: record.created_at
    }));
    
    res.json({ records: formattedRecords });
  });
});

// 老师端API - 导出学生信息为Excel
app.post('/api/teacher/export-students', (req, res) => {
  const { class_name, students } = req.body;
  
  console.log('接收到导出请求:', { class_name, studentsCount: students?.length }); // 调试日志
  
  if (!class_name || !Array.isArray(students) || students.length === 0) {
    console.log('参数错误:', { class_name, students });
    return res.status(400).json({ message: '参数错误' });
  }

  try {
    // 准备Excel数据
    const worksheetData = [
      ['学号', '姓名', '年级', '班级', '当前分值', '导出时间'] // 表头
    ];

    // 添加学生数据
    students.forEach(student => {
      worksheetData.push([
        student.student_id || '',
        student.name || '',
        student.grade || '',
        student.class_name || student.class || '',
        student.score || 0,
        new Date().toLocaleString('zh-CN')
      ]);
    });

    console.log('Excel数据准备完成，行数:', worksheetData.length);

    // 创建工作簿和工作表
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 学号
      { wch: 12 }, // 姓名
      { wch: 10 }, // 年级
      { wch: 15 }, // 班级
      { wch: 12 }, // 分值
      { wch: 20 }  // 导出时间
    ];
    worksheet['!cols'] = colWidths;

    // 添加工作表到工作簿
    xlsx.utils.book_append_sheet(workbook, worksheet, `${class_name}班学生信息`);

    console.log('Excel文件生成中...');

    // 生成Excel文件缓冲区
    const excelBuffer = xlsx.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });    console.log('Excel文件生成成功，大小:', excelBuffer.length, 'bytes');

    // 设置响应头（修复中文编码问题）
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // 使用安全的文件名编码
    const safeFileName = `${class_name.replace(/[^\w\d]/g, '_')}_学生信息_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const encodedFileName = encodeURIComponent(safeFileName);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
    
    // 发送文件
    res.send(excelBuffer);
  } catch (error) {
    console.error('Excel导出失败:', error);
    res.status(500).json({ message: 'Excel导出失败' });
  }
});

// 老师账号管理 API
// 获取所有老师账号
app.get('/api/teachers', (req, res) => {
  const query = 'SELECT id, username, name FROM users WHERE user_type = "teacher" ORDER BY id DESC';
  console.log('执行查询:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('查询老师列表失败:', err);
      return res.status(500).json({ message: '查询失败', error: err.message });
    }
    console.log('查询结果:', results);
    // 为每个结果添加一个默认的创建时间
    const resultsWithDate = results.map(teacher => ({
      ...teacher,
      created_at: new Date().toISOString()
    }));
    res.json(resultsWithDate);
  });
});

// 创建老师账号
app.post('/api/teachers', (req, res) => {
  const { username, name, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  if (!name) {
    return res.status(400).json({ message: '姓名不能为空' });
  }

  // 检查用户名是否已存在
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ message: '数据库查询失败' });
    
    if (results.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 创建新老师账号
    db.query('INSERT INTO users (username, password, user_type, name) VALUES (?, ?, "teacher", ?)', 
      [username, password, name], 
      (err, result) => {
        if (err) return res.status(500).json({ message: '创建账号失败' });
        res.json({ message: '老师账号创建成功', id: result.insertId });
      }
    );
  });
});

// 删除老师账号
app.delete('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  
  // 先检查是否为老师账号
  db.query('SELECT * FROM users WHERE id = ? AND user_type = "teacher"', [id], (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    
    if (results.length === 0) {
      return res.status(404).json({ message: '老师账号不存在' });
    }

    // 删除老师账号
    db.query('DELETE FROM users WHERE id = ? AND user_type = "teacher"', [id], (err, result) => {
      if (err) return res.status(500).json({ message: '删除失败' });
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '老师账号不存在' });
      }
      
      res.json({ message: '老师账号删除成功' });
    });
  });
});

// ==================== 归档功能 API ====================

// 获取归档统计信息
app.get('/api/admin/archive/stats', (req, res) => {
  const currentYear = new Date().getFullYear();
  
  // 查询所有年级的学生信息
  db.query(`
    SELECT 
      grade,
      COUNT(*) as student_count,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
      COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count
    FROM students 
    WHERE grade IS NOT NULL AND grade != ''
    GROUP BY grade
    ORDER BY grade
  `, (err, gradeResults) => {
    if (err) {
      console.error('查询年级统计失败:', err);
      return res.status(500).json({ message: '查询失败' });
    }

    // 计算可归档的年级（年级 + 4 <= 当前年份）
    const graduatedGrades = [];
    let archivableStudents = 0;
    let totalStudents = 0;

    gradeResults.forEach(row => {
      const gradeYear = parseInt(row.grade);
      totalStudents += row.student_count;
      
      if (!isNaN(gradeYear) && (gradeYear + 4 <= currentYear)) {
        graduatedGrades.push(row.grade);
        archivableStudents += row.active_count; // 只计算活跃状态的学生
      }
    });

    if (graduatedGrades.length === 0) {
      return res.json({
        totalStudents,
        graduatedGrades: [],
        archivableStudents: 0,
        archivableRecords: 0,
        archivableApplications: 0,
        estimatedSpaceSaving: '0 MB'
      });
    }    // 查询可归档的记录数和申请数
    const gradeList = graduatedGrades.map(g => `'${g}'`).join(',');
    
    db.query(`
      SELECT 
        (SELECT COUNT(*) FROM score_records sr 
         JOIN students s ON sr.student_id = s.student_id 
         WHERE s.grade IN (${gradeList}) AND s.status = 'active' AND sr.status = 'active') as record_count,
        (SELECT COUNT(*) FROM score_applications sa 
         JOIN students s ON sa.student_id = s.student_id 
         WHERE s.grade IN (${gradeList}) AND s.status = 'active' AND sa.archive_status = 'active') as application_count
    `, (err, countResults) => {
      if (err) {
        console.error('查询记录统计失败:', err);
        return res.status(500).json({ message: '查询失败' });
      }

      const archivableRecords = countResults[0].record_count || 0;
      const archivableApplications = countResults[0].application_count || 0;
      
      // 估算空间节省（简单估算：每条记录约1KB）
      const totalRecords = archivableStudents + archivableRecords + archivableApplications;
      const estimatedSpaceSaving = `${Math.round(totalRecords / 1024)} MB`;

      res.json({
        totalStudents,
        graduatedGrades,
        archivableStudents,
        archivableRecords,
        archivableApplications,
        estimatedSpaceSaving
      });
    });
  });
});

// 执行归档操作
app.post('/api/admin/archive/execute', (req, res) => {
  const { grades, reason } = req.body;
  const createdBy = 'admin'; // 实际应用中应该从token获取

  if (!Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ message: '请选择要归档的年级' });
  }

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: '请填写归档原因' });
  }

  const gradeList = grades.map(g => `'${g}'`).join(',');
  
  // 开始事务
  db.beginTransaction((err) => {
    if (err) {
      console.error('开始事务失败:', err);
      return res.status(500).json({ message: '归档失败' });
    }

    // 1. 获取要归档的数据统计
    db.query(`      SELECT 
        (SELECT COUNT(*) FROM students WHERE grade IN (${gradeList}) AND status = 'active') as student_count,
        (SELECT COUNT(*) FROM score_records sr 
         JOIN students s ON sr.student_id = s.student_id 
         WHERE s.grade IN (${gradeList}) AND s.status = 'active' AND sr.status = 'active') as record_count,
        (SELECT COUNT(*) FROM score_applications sa 
         JOIN students s ON sa.student_id = s.student_id 
         WHERE s.grade IN (${gradeList}) AND s.status = 'active' AND sa.archive_status = 'active') as application_count
    `, (err, countResults) => {
      if (err) {
        return db.rollback(() => {
          console.error('查询统计失败:', err);
          res.status(500).json({ message: '归档失败' });
        });
      }

      const stats = countResults[0];
      
      // 2. 导出数据到JSON格式（实际应用中应该写入文件）
      db.query(`
        SELECT s.*,               (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                 'id', sr.id,
                 'student_id', sr.student_id,
                 'score_change', sr.delta,
                 'reason', sr.reason,
                 'created_by', sr.operator,
                 'created_at', sr.created_at
               )) FROM score_records sr WHERE sr.student_id = s.student_id AND sr.status = 'active') as records,(SELECT JSON_ARRAYAGG(JSON_OBJECT(
                 'id', sa.id,
                 'student_id', sa.student_id,
                 'score_change', sa.delta,
                 'reason', sa.reason,
                 'status', sa.status,
                 'created_by', sa.teacher,
                 'created_at', sa.created_at,
                 'date', sa.date
               )) FROM score_applications sa WHERE sa.student_id = s.student_id AND sa.archive_status = 'active') as applications
        FROM students s 
        WHERE s.grade IN (${gradeList}) AND s.status = 'active'
      `, (err, archiveData) => {
        if (err) {
          return db.rollback(() => {
            console.error('导出数据失败:', err);
            res.status(500).json({ message: '归档失败' });
          });
        }        // 3. 删除相关申请记录
        db.query(`
          DELETE sa FROM score_applications sa 
          JOIN students s ON sa.student_id = s.student_id 
          WHERE s.grade IN (${gradeList}) AND s.status = 'active'
        `, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('删除申请记录失败:', err);
              res.status(500).json({ message: '归档失败' });
            });
          }

          // 4. 删除相关分数记录
          db.query(`
            DELETE sr FROM score_records sr 
            JOIN students s ON sr.student_id = s.student_id 
            WHERE s.grade IN (${gradeList}) AND s.status = 'active'
          `, (err) => {
            if (err) {
              return db.rollback(() => {
                console.error('删除分数记录失败:', err);
                res.status(500).json({ message: '归档失败' });
              });
            }

            // 5. 删除学生记录
            db.query(`DELETE FROM students WHERE grade IN (${gradeList}) AND status = 'active'`, (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('删除学生记录失败:', err);
                  res.status(500).json({ message: '归档失败' });
                });
              }              // 6. 记录归档日志
              const archiveDate = new Date().toISOString().split('T')[0];
              const filePath = `archives/archive_${archiveDate}_${Date.now()}.json`;
              const fileSize = JSON.stringify(archiveData).length;

              // 创建完整的归档数据包
              const fullArchiveData = {
                archiveInfo: {
                  archiveDate: archiveDate,
                  grades: grades,
                  reason: reason.trim(),
                  createdBy: createdBy,
                  createdAt: new Date().toISOString()
                },
                statistics: {
                  studentCount: stats.student_count,
                  recordCount: stats.record_count,
                  applicationCount: stats.application_count
                },
                students: archiveData
              };

              db.query(`
                INSERT INTO archive_logs (
                  archive_date, grades_archived, file_path, 
                  student_count, record_count, application_count, 
                  file_size, archive_reason, created_by, archive_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                archiveDate, JSON.stringify(grades), filePath,
                stats.student_count, stats.record_count, stats.application_count,
                fileSize, reason.trim(), createdBy, JSON.stringify(fullArchiveData)
              ], (err, result) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('记录归档日志失败:', err);
                    res.status(500).json({ message: '归档失败' });
                  });
                }

                // 提交事务
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('提交事务失败:', err);
                      res.status(500).json({ message: '归档失败' });
                    });
                  }

                  console.log(`归档完成: ${grades.join(', ')} 年级，共 ${stats.student_count} 名学生`);
                  res.json({
                    message: '归档成功',
                    archiveId: result.insertId,
                    stats: {
                      studentCount: stats.student_count,
                      recordCount: stats.record_count,
                      applicationCount: stats.application_count,
                      grades: grades
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// 获取归档历史记录
app.get('/api/admin/archive/logs', (req, res) => {
  db.query(`
    SELECT 
      id,
      archive_date,
      grades_archived,
      student_count,
      record_count,
      application_count,
      file_size,
      archive_reason,
      created_by,
      created_at
    FROM archive_logs 
    ORDER BY created_at DESC
  `, (err, results) => {
    if (err) {
      console.error('查询归档记录失败:', err);
      return res.status(500).json({ message: '查询失败' });
    }    // 解析grades_archived JSON字符串
    const logs = results.map(log => {
      let grades_archived;
      try {
        // 检查是否已经是有效的JSON字符串
        const gradesData = log.grades_archived;
        if (typeof gradesData === 'string') {
          grades_archived = JSON.parse(gradesData);
        } else if (Array.isArray(gradesData)) {
          grades_archived = gradesData;
        } else {
          grades_archived = [];
        }
        
        // 确保是数组
        if (!Array.isArray(grades_archived)) {
          grades_archived = [];
        }
      } catch (error) {
        console.error('解析 grades_archived 失败:', error, '原始数据:', log.grades_archived);
        grades_archived = [];
      }
      
      return {
        ...log,
        grades_archived
      };
    });

    res.json({ logs });
  });
});

// 下载归档文件 - 完整版
app.get('/api/admin/archive/download/:id', (req, res) => {
  const archiveId = req.params.id;
  console.log('📥 收到下载请求, ID:', archiveId);
  
  if (!archiveId || isNaN(archiveId)) {
    console.log('❌ 无效的归档ID');
    return res.status(400).json({ message: '无效的归档ID' });
  }

  try {
    // 查询归档记录
    db.query('SELECT * FROM archive_logs WHERE id = ?', [archiveId], (err, results) => {
      if (err) {
        console.error('❌ 查询失败:', err);
        return res.status(500).json({ message: '查询失败' });
      }

      if (results.length === 0) {
        console.log('❌ 记录不存在');
        return res.status(404).json({ message: '归档记录不存在' });
      }

      console.log('✅ 找到记录');
      const archiveLog = results[0];
      
      let downloadData;
      
      // 如果有完整的归档数据，使用它
      if (archiveLog.archive_data) {
        try {
          downloadData = JSON.parse(archiveLog.archive_data);
          console.log('✅ 使用完整归档数据');
        } catch (parseErr) {
          console.error('❌ 解析归档数据失败:', parseErr);
          // 如果解析失败，使用简化数据
          downloadData = {
            archiveInfo: {
              id: archiveLog.id,
              archiveDate: archiveLog.archive_date,
              grades: JSON.parse(archiveLog.grades_archived || '[]'),
              reason: archiveLog.archive_reason,
              createdBy: archiveLog.created_by,
              createdAt: archiveLog.created_at
            },
            statistics: {
              studentCount: archiveLog.student_count,
              recordCount: archiveLog.record_count,
              applicationCount: archiveLog.application_count
            },
            note: '归档摘要信息（完整数据解析失败）'
          };
        }
      } else {
        // 兼容旧的归档记录，提供简化数据
        downloadData = {
          archiveInfo: {
            id: archiveLog.id,
            archiveDate: archiveLog.archive_date,
            grades: JSON.parse(archiveLog.grades_archived || '[]'),
            reason: archiveLog.archive_reason,
            createdBy: archiveLog.created_by,
            createdAt: archiveLog.created_at
          },
          statistics: {
            studentCount: archiveLog.student_count,
            recordCount: archiveLog.record_count,
            applicationCount: archiveLog.application_count
          },
          note: '归档摘要信息（旧版本归档，无完整数据）'
        };
        console.log('⚠️ 使用简化归档数据（旧版本）');
      }

      console.log('📤 发送响应');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="archive_${archiveId}.json"`);
      res.json(downloadData);
    });
  } catch (error) {
    console.error('💥 处理错误:', error);
    res.status(500).json({ message: '处理失败' });
  }
});

// 老师修改密码接口
app.post('/api/teacher/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ message: '参数不完整' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: '新密码长度不能少于6位' });
  }

  // 首先验证当前密码是否正确
  db.query('SELECT * FROM users WHERE username = ? AND password = ? AND user_type = "teacher"', 
    [username, currentPassword], 
    (err, results) => {
      if (err) {
        console.error('验证当前密码失败:', err);
        return res.status(500).json({ message: '数据库查询失败' });
      }
      
      if (results.length === 0) {
        return res.status(400).json({ message: '当前密码错误' });
      }

      // 检查新密码是否与当前密码相同
      if (currentPassword === newPassword) {
        return res.status(400).json({ message: '新密码不能与当前密码相同' });
      }

      // 更新密码
      db.query('UPDATE users SET password = ? WHERE username = ? AND user_type = "teacher"', 
        [newPassword, username], 
        (err, result) => {
          if (err) {
            console.error('更新密码失败:', err);
            return res.status(500).json({ message: '密码更新失败' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: '用户不存在' });
          }

          console.log(`老师 ${username} 成功修改密码`);
          res.json({ message: '密码修改成功' });
        }
      );
    }
  );
});

app.listen(3000, () => {
  console.log('服务器已启动，端口：3000');
});
