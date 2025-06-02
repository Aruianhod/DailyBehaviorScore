const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'score_system'
});

console.log('=== 连接数据库... ===');
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
  checkGrades();
});

function checkGrades() {
console.log('=== 查询当前年级分布 ===');
db.query('SELECT grade, COUNT(*) as count FROM students WHERE status = "active" GROUP BY grade ORDER BY grade', (err, results) => {
  if (err) {
    console.error('查询失败:', err);
    process.exit(1);
  }
  
  console.log('当前活跃学生按年级分布:');
  results.forEach(row => {
    console.log(`- ${row.grade}级: ${row.count}名学生`);
  });
  
  console.log('\n=== 归档条件检查 (2025年) ===');
  results.forEach(row => {
    const gradeYear = parseInt(row.grade);
    const isArchivable = !isNaN(gradeYear) && (gradeYear + 4 <= 2025);
    console.log(`- ${row.grade}级: ${gradeYear + 4 <= 2025 ? '✅ 可归档' : '❌ 不可归档'} (${gradeYear} + 4 = ${gradeYear + 4})`);
  });  
  db.end();
});
}
