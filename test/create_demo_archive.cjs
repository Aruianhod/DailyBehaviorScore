const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'score_system'
});

// 创建演示用的测试数据
const testStudents = [
  { student_id: 'DEMO001', name: '张三', grade: '1999', class: '1班', score: 85 },
  { student_id: 'DEMO002', name: '李四', grade: '1999', class: '1班', score: 92 },
  { student_id: 'DEMO003', name: '王五', grade: '1999', class: '2班', score: 78 }
];

console.log('开始创建演示数据...');

// 插入测试学生
const insertStudents = () => {
  const values = testStudents.map(s => [s.student_id, s.name, s.grade, s.class, s.score]);
  
  db.query('INSERT IGNORE INTO students (student_id, name, grade, class, score) VALUES ?', [values], (err, result) => {
    if (err) {
      console.error('插入学生数据失败:', err);
      return;
    }
    console.log('✅ 学生数据插入成功:', result.affectedRows, '条记录');
    
    // 为学生添加一些分数记录
    addScoreRecords();
  });
};

const addScoreRecords = () => {
  const scoreRecords = [
    ['DEMO001', 5, '参与校运会', 'teacher1', new Date()],
    ['DEMO001', -3, '迟到', 'teacher2', new Date()],
    ['DEMO002', 8, '优秀作业', 'teacher1', new Date()],
    ['DEMO003', -2, '忘记作业', 'teacher2', new Date()]
  ];
  
  db.query('INSERT INTO score_records (student_id, delta, reason, operator, created_at) VALUES ?', [scoreRecords], (err, result) => {
    if (err) {
      console.error('插入分数记录失败:', err);
      return;
    }
    console.log('✅ 分数记录插入成功:', result.affectedRows, '条记录');
    
    // 添加申请记录
    addApplications();
  });
};

const addApplications = () => {
  const applications = [
    ['DEMO001', 3, '社团活动加分申请', 'teacher1', 'pending', new Date().toISOString().split('T')[0]],
    ['DEMO002', -1, '违纪扣分申请', 'teacher2', 'approved', new Date().toISOString().split('T')[0]]
  ];
  
  db.query('INSERT INTO score_applications (student_id, delta, reason, teacher, status, date) VALUES ?', [applications], (err, result) => {
    if (err) {
      console.error('插入申请记录失败:', err);
      return;
    }
    console.log('✅ 申请记录插入成功:', result.affectedRows, '条记录');
    console.log('🎉 演示数据创建完成！');
    console.log('可以对 1999 年级进行归档测试了');
    db.end();
  });
};

db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('✅ 数据库连接成功');
  insertStudents();
});
