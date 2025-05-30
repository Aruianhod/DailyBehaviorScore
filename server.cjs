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

// 学生列表
app.get('/api/admin/students', (req, res) => {
  db.query('SELECT student_id as id, name, grade, class, score FROM students', (err, results) => {
    if (err) return res.status(500).json({ message: '数据库错误' });
    res.json({ students: results });
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
    res.json({ records: results });
  });
});

// 老师提交分值修改申请（支持多人一条）
app.post('/api/teacher/apply', (req, res) => {
  const { students, delta, reason, date } = req.body;
  if (!Array.isArray(students) || !students.length || !reason || typeof delta !== 'number' || !date) {
    return res.status(400).json({ message: '参数不完整' });
  }
  const student_ids = students.map(s => s.id);
  const student_names = students.map(s => s.name);
  db.query(
    'INSERT INTO score_applications (student_ids, student_names, delta, reason, date, status) VALUES (?, ?, ?, ?, ?, ?)',
    [JSON.stringify(student_ids), JSON.stringify(student_names), delta, reason, date, 'pending'],
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
  db.query('SELECT * FROM score_applications WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: '申请不存在' });
    const app = results[0];
    let ids = [];
    try { ids = JSON.parse(app.student_ids || '[]'); } catch { ids = app.student_id ? [app.student_id] : []; }
    if (!ids.length) return res.status(400).json({ message: '无学生信息' });
    let finished = 0, failed = 0;
    ids.forEach(sid => {
      db.query('UPDATE students SET score = score + ? WHERE student_id = ?', [app.delta, sid], err2 => {
        if (err2) { failed++; check(); return; }
        db.query('INSERT INTO score_records (student_id, operator, reason, delta, created_at) VALUES (?, ?, ?, ?, ?)',
          [sid, 'admin', app.reason, app.delta, app.date], err3 => {
          if (err3) { failed++; }
          check();
        });
      });
    });
    function check() {
      finished++;
      if (finished === ids.length) {
        db.query('UPDATE score_applications SET status = "approved" WHERE id = ?', [id], err4 => {
          if (err4) return res.status(500).json({ message: '更新申请状态失败' });
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
    db.query('UPDATE score_applications SET status = "rejected", reason = CONCAT(reason, "（驳回理由：", ? ,"）") WHERE id = ?', [reason, id], err2 => {
      if (err2) return res.status(500).json({ message: '更新申请状态失败' });
      db.query('SELECT teacher FROM score_applications WHERE id = ?', [id], (err3, r3) => {
        let teacher = app.teacher;
        if (!teacher) teacher = 'teacher1';
        db.query('INSERT INTO notifications (user, content) VALUES (?, ?)',
          [teacher, `你提交的学生${app.student_id}（${app.student_name}）分值申请被驳回，理由：${reason}`], err4 => {
          if (err4) return res.status(500).json({ message: '通知发送失败' });
          res.json({ message: '已驳回并通知老师' });
        });
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
  
  const teacher = 'teacher1';
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
      // 处理人、处理时间、驳回理由
      r.reviewer = r.status !== '待审核' ? '管理员' : '';
      r.reviewed_at = r.status !== '待审核' ? r.updated_at || r.created_at : '';
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
          date: r.date,
          status: r.status,
          reviewer: r.reviewer,
          reviewed_at: r.reviewed_at,
          reject_reason: r.reject_reason
        });
      });
    });
    res.json({ applications });
  });
});

app.listen(3000, () => {
  console.log('服务器已启动，端口：3000');
});
