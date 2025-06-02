const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'score_system'
});

console.log('=== 创建归档测试数据 ===');

db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
  
  // 创建2020级和2021级的测试学生
  const testStudents = [
    // 2020级学生 - 应该可以归档 (2020 + 4 = 2024 ≤ 2025)
    { id: '2020010101', name: '张三', grade: '2020', class: '20101', score: 85 },
    { id: '2020010102', name: '李四', grade: '2020', class: '20101', score: 90 },
    { id: '2020010201', name: '王五', grade: '2020', class: '20102', score: 78 },
    
    // 2021级学生 - 应该可以归档 (2021 + 4 = 2025 ≤ 2025)
    { id: '2021010101', name: '赵六', grade: '2021', class: '21101', score: 88 },
    { id: '2021010102', name: '钱七', grade: '2021', class: '21101', score: 92 }
  ];
  
  console.log('插入测试学生数据...');
  
  const insertPromises = testStudents.map(student => {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT IGNORE INTO students (student_id, name, grade, class, score, status) VALUES (?, ?, ?, ?, ?, "active")',
        [student.id, student.name, student.grade, student.class, student.score],
        (err, result) => {
          if (err) {
            console.error(`插入学生 ${student.name} 失败:`, err);
            reject(err);
          } else {
            console.log(`✅ 插入学生: ${student.name} (${student.grade}级)`);
            resolve(result);
          }
        }
      );
    });
  });
  
  Promise.all(insertPromises)
    .then(() => {
      console.log('\n=== 创建分值记录 ===');
      // 为这些学生创建一些分值记录
      const recordPromises = testStudents.map(student => {
        return new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO score_records (student_id, operator, reason, delta, created_at, status) VALUES (?, ?, ?, ?, ?, "active")',
            [student.id, '管理员', '期中考试奖励', 5, new Date()],
            (err, result) => {
              if (err) {
                console.error(`创建分值记录失败:`, err);
                reject(err);
              } else {
                console.log(`✅ 创建分值记录: ${student.name}`);
                resolve(result);
              }
            }
          );
        });
      });
      
      return Promise.all(recordPromises);
    })
    .then(() => {
      console.log('\n=== 验证数据创建结果 ===');
      return new Promise((resolve, reject) => {
        db.query('SELECT grade, COUNT(*) as count FROM students WHERE status = "active" GROUP BY grade ORDER BY grade', (err, results) => {
          if (err) {
            reject(err);
          } else {
            console.log('更新后的年级分布:');
            results.forEach(row => {
              const gradeYear = parseInt(row.grade);
              const isArchivable = !isNaN(gradeYear) && (gradeYear + 4 <= 2025);
              console.log(`- ${row.grade}级: ${row.count}名学生 ${isArchivable ? '✅ 可归档' : '❌ 不可归档'}`);
            });
            resolve();
          }
        });
      });
    })
    .then(() => {
      console.log('\n✅ 测试数据创建完成！');
      console.log('现在您可以测试归档功能：');
      console.log('1. 前端应该显示2020级和2021级可以归档');
      console.log('2. 归档操作应该能成功删除这些年级的数据');
      db.end();
    })
    .catch((error) => {
      console.error('创建测试数据失败:', error);
      db.end();
      process.exit(1);
    });
});
