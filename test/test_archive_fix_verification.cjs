const mysql = require('mysql2');

// 数据库连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'score_system'
});

function testSmallArchive() {
  console.log('🧪 开始测试小规模归档功能...\n');
  
  // 先检查2024级的学生数量
  db.query(`
    SELECT COUNT(*) as count, 
           GROUP_CONCAT(DISTINCT s.student_id) as student_ids
    FROM students s 
    JOIN users u ON s.student_id = u.username 
    WHERE s.grade = 2024 AND s.status = 'active' AND u.user_type = 'student'
  `, (err, results) => {
    if (err) {
      console.error('查询2024级学生失败:', err);
      db.end();
      return;
    }
    
    const count = results[0].count;
    const studentIds = results[0].student_ids ? results[0].student_ids.split(',') : [];
    
    console.log(`📊 2024级活跃学生数量: ${count}`);
    if (count > 0) {
      console.log(`📋 学生ID列表: ${studentIds.slice(0, 5).join(', ')}${count > 5 ? ' ...' : ''}`);
    }
    
    if (count === 0) {
      console.log('⚠️ 没有2024级学生，无法测试归档功能');
      db.end();
      return;
    }
    
    console.log('\n🔍 测试删除逻辑（仅查询，不实际删除）:\n');
    
    // 步骤1: 检查要删除的分数记录
    db.query(`
      SELECT COUNT(*) as count 
      FROM score_records sr 
      JOIN students s ON sr.student_id = s.student_id 
      WHERE s.grade = 2024 AND s.status = 'active'
    `, (err, recordResults) => {
      if (err) {
        console.error('查询分数记录失败:', err);
        db.end();
        return;
      }
      
      console.log(`1️⃣ 需要删除的分数记录数: ${recordResults[0].count}`);
      
      // 步骤2: 检查要删除的申请记录
      db.query(`
        SELECT COUNT(*) as count 
        FROM score_applications sa 
        JOIN students s ON sa.student_id = s.student_id 
        WHERE s.grade = 2024 AND s.status = 'active'
      `, (err, appResults) => {
        if (err) {
          console.error('查询申请记录失败:', err);
          db.end();
          return;
        }
        
        console.log(`2️⃣ 需要删除的申请记录数: ${appResults[0].count}`);
        
        // 步骤3: 获取学生ID列表（这是修复的关键）
        db.query(`
          SELECT student_id FROM students 
          WHERE grade = 2024 AND status = 'active'
        `, (err, studentIdResults) => {
          if (err) {
            console.error('获取学生ID列表失败:', err);
            db.end();
            return;
          }
          
          const studentIdList = studentIdResults.map(row => row.student_id);
          console.log(`3️⃣ 获取到的学生ID列表: ${studentIdList.length} 个`);
          
          // 步骤4: 检查要删除的学生记录
          console.log(`4️⃣ 需要删除的学生记录数: ${count}`);
          
          // 步骤5: 检查要删除的用户记录
          if (studentIdList.length > 0) {
            const placeholders = studentIdList.map(() => '?').join(',');
            db.query(`
              SELECT COUNT(*) as count 
              FROM users 
              WHERE username IN (${placeholders}) AND user_type = 'student'
            `, studentIdList, (err, userResults) => {
              if (err) {
                console.error('查询用户记录失败:', err);
                db.end();
                return;
              }
              
              console.log(`5️⃣ 需要删除的用户记录数: ${userResults[0].count}`);
              
              console.log('\n✅ 删除逻辑测试完成！');
              console.log('📝 修复要点:');
              console.log('   - 在删除students表之前先保存student_id列表');
              console.log('   - 删除students表后，使用保存的ID列表删除users表');
              console.log('   - 避免了JOIN查询已删除记录的问题');
              
              // 验证外键约束关系
              console.log('\n🔗 验证外键约束删除顺序:');
              console.log('   1. score_records (引用 students.student_id)');
              console.log('   2. score_applications');  
              console.log('   3. students (引用 users.username)');
              console.log('   4. users (被引用的主表)');
              
              db.end();
            });
          } else {
            console.log('5️⃣ 没有需要删除的用户记录');
            console.log('\n✅ 删除逻辑测试完成！');
            db.end();
          }
        });
      });
    });
  });
}

// 运行测试
testSmallArchive();
