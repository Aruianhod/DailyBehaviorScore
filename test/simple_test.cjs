// 简单测试归档修复
console.log('测试归档修复...');

const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '123456',
  database: 'score_system'
});

db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  
  console.log('✅ 数据库连接成功');
  
  // 查询2024级学生
  db.query("SELECT COUNT(*) as count FROM students WHERE grade = 2024 AND status = 'active'", (err, results) => {
    if (err) {
      console.error('查询失败:', err);
      db.end();
      return;
    }
    
    console.log(`2024级学生数量: ${results[0].count}`);
    db.end();
    console.log('测试完成');
  });
});
