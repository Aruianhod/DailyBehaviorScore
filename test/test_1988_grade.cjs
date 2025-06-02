const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'score_system'
});

console.log('=== 测试1988级归档功能 ===');

db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
  
  // 创建1988级测试学生
  const test1988Students = [
    { id: '1988010101', name: '张老前辈', grade: '1988', class: '88101', score: 95 },
    { id: '1988010102', name: '李老校友', grade: '1988', class: '88101', score: 88 },
    { id: '1988010201', name: '王老同学', grade: '1988', class: '88102', score: 92 }
  ];
  
  console.log('插入1988级测试学生数据...');
  
  const insertPromises = test1988Students.map(student => {
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
      console.log('\n=== 创建1988级分值记录 ===');
      const recordPromises = test1988Students.map(student => {
        return new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO score_records (student_id, operator, reason, delta, created_at, status) VALUES (?, ?, ?, ?, ?, "active")',
            [student.id, '管理员', '历史数据录入', 10, new Date()],
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
      console.log('\n=== 验证1988级归档条件 ===');
      const currentYear = 2025;
      const gradeYear = 1988;
      const canArchive = gradeYear + 4 <= currentYear;
      
      console.log(`年级: ${gradeYear}`);
      console.log(`年级 + 4: ${gradeYear + 4}`);
      console.log(`当前年份: ${currentYear}`);
      console.log(`归档条件: ${gradeYear} + 4 <= ${currentYear}`);
      console.log(`结果: ${canArchive ? '✅ 可以归档' : '❌ 不能归档'}`);
      
      return new Promise((resolve, reject) => {
        db.query('SELECT grade, COUNT(*) as count FROM students WHERE grade = "1988" AND status = "active"', (err, results) => {
          if (err) {
            reject(err);
          } else {
            console.log(`\n1988级学生数量: ${results[0]?.count || 0}名`);
            resolve();
          }
        });
      });
    })
    .then(() => {
      console.log('\n=== 测试归档API调用 ===');
      console.log('您现在可以：');
      console.log('1. 在前端界面中查看归档统计，应该显示1988级可以归档');
      console.log('2. 执行归档操作，应该成功删除1988级数据');
      console.log('3. 验证归档后1988级数据是否被删除');
      
      db.end();
    })
    .catch((error) => {
      console.error('测试1988级失败:', error);
      db.end();
      process.exit(1);
    });
});
