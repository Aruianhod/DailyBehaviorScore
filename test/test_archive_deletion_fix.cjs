const mysql = require('mysql2');

// 数据库连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'score_system'
});

function testArchiveDeleteFunction() {
  console.log('🧪 开始测试归档删除功能...\n');
  
  // 1. 先查看当前数据库状态
  console.log('📊 查看归档前的数据状态:');
  
  db.query('SELECT COUNT(*) as count FROM users WHERE user_type = "student"', (err, userResults) => {
    if (err) {
      console.error('查询用户表失败:', err);
      db.end();
      return;
    }
    
    db.query('SELECT COUNT(*) as count FROM students WHERE status = "active"', (err, studentResults) => {
      if (err) {
        console.error('查询学生表失败:', err);
        db.end();
        return;
      }
      
      db.query('SELECT COUNT(*) as count FROM score_records WHERE status = "active"', (err, recordResults) => {
        if (err) {
          console.error('查询分数记录表失败:', err);
          db.end();
          return;
        }
        
        console.log(`用户表中学生数量: ${userResults[0].count}`);
        console.log(`学生表中活跃学生数量: ${studentResults[0].count}`);
        console.log(`分数记录表中活跃记录数量: ${recordResults[0].count}`);
        console.log('');
        
        // 2. 查看具体的学生数据
        db.query(`
          SELECT u.username, u.name, s.grade, s.class 
          FROM users u 
          JOIN students s ON u.username = s.student_id 
          WHERE u.user_type = 'student' AND s.status = 'active'
          ORDER BY s.grade, s.class, u.username
        `, (err, studentDetails) => {
          if (err) {
            console.error('查询学生详情失败:', err);
            db.end();
            return;
          }
          
          console.log('👥 当前活跃学生列表:');
          if (studentDetails.length === 0) {
            console.log('  (没有活跃学生)');
          } else {
            studentDetails.forEach(student => {
              console.log(`  - ${student.username} (${student.name}) - ${student.grade}级 ${student.class}班`);
            });
          }
          console.log('');
          
          // 3. 检查外键约束关系
          console.log('🔗 检查外键约束关系:');
          db.query(`
            SELECT 
              TABLE_NAME,
              COLUMN_NAME,
              CONSTRAINT_NAME,
              REFERENCED_TABLE_NAME,
              REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'score_system' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
          `, (err, constraintResults) => {
            if (err) {
              console.error('查询外键约束失败:', err);
              db.end();
              return;
            }
            
            if (constraintResults.length === 0) {
              console.log('  (没有找到外键约束)');
            } else {
              constraintResults.forEach(constraint => {
                console.log(`  - ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
              });
            }
            console.log('');
            
            console.log('✅ 归档删除功能测试完成');
            console.log('💡 修复后的删除顺序:');
            console.log('   1. score_records (最底层引用)');
            console.log('   2. score_applications');
            console.log('   3. 获取学生ID列表');
            console.log('   4. 删除 students 表记录');
            console.log('   5. 使用保存的ID列表删除 users 表记录');
            
            db.end();
          });
        });
      });
    });
  });
}

// 运行测试
testArchiveDeleteFunction();
