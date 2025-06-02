const mysql = require('mysql2');

// 数据库连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'score_system'
});

async function checkDatabase() {
    return new Promise((resolve, reject) => {
        db.connect(err => {
            if (err) {
                console.error('❌ 数据库连接失败:', err);
                reject(err);
                return;
            }
            console.log('✅ 数据库连接成功');
            
            // 检查表结构
            db.query("SHOW TABLES", (err, tables) => {
                if (err) {
                    console.error('❌ 查询表失败:', err);
                    reject(err);
                    return;
                }
                
                console.log('📋 数据库表:', tables.map(t => Object.values(t)[0]));
                
                // 检查学生数据
                db.query("SELECT COUNT(*) as count FROM students", (err, result) => {
                    if (err) {
                        console.error('❌ 查询学生数据失败:', err);
                        reject(err);
                        return;
                    }
                    
                    console.log(`👥 学生总数: ${result[0].count}`);
                    
                    // 检查年级分布
                    db.query("SELECT grade, COUNT(*) as count FROM students GROUP BY grade ORDER BY grade", (err, grades) => {
                        if (err) {
                            console.error('❌ 查询年级数据失败:', err);
                            reject(err);
                            return;
                        }
                        
                        console.log('📊 年级分布:');
                        grades.forEach(g => {
                            console.log(`  ${g.grade}级: ${g.count}人`);
                        });
                        
                        // 检查归档日志表
                        db.query("SELECT COUNT(*) as count FROM archive_logs", (err, result) => {
                            if (err) {
                                console.error('❌ 查询归档日志失败:', err);
                                reject(err);
                                return;
                            }
                            
                            console.log(`📁 归档记录数: ${result[0].count}`);
                            
                            db.end();
                            resolve();
                        });
                    });
                });
            });
        });
    });
}

checkDatabase().catch(console.error);
