// 检查数据库结构和1955年学生数据
const mysql = require('mysql2/promise');

async function main() {
    console.log('🔍 检查数据库结构和1955年学生数据...');

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'score_system'
    });

    try {
        // 检查学生表结构
        console.log('\n📋 学生表结构:');
        const [columns] = await connection.execute('DESCRIBE students');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? '[' + col.Key + ']' : ''}`);
        });

        // 查询所有1955年学生
        console.log('\n👥 查询1955年学生:');
        const [students] = await connection.execute(`
            SELECT student_id, name, grade, class, status 
            FROM students 
            WHERE grade = '1955' 
            ORDER BY student_id
        `);

        if (students.length === 0) {
            console.log('  ❌ 没有找到1955年的学生记录！');
        } else {
            console.log(`  ✅ 找到 ${students.length} 个1955年学生:`);
            students.forEach(student => {
                console.log(`    - ${student.student_id} (${student.name}) - ${student.grade}级${student.class}班 [状态: ${student.status}]`);
            });
        }

        // 查询状态分布
        console.log('\n📊 1955年学生状态分布:');
        const [statusDist] = await connection.execute(`
            SELECT status, COUNT(*) as count 
            FROM students 
            WHERE grade = '1955' 
            GROUP BY status
        `);

        if (statusDist.length === 0) {
            console.log('  - 没有任何1955年学生记录');
        } else {
            statusDist.forEach(row => {
                console.log(`  - ${row.status || 'NULL'} 状态: ${row.count} 个`);
            });
        }

        // 测试归档查询
        console.log('\n🔍 测试归档查询:');
        const gradeList = "'1955'";
        const [archiveQuery] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM students 
            WHERE grade IN (${gradeList}) AND status = 'active'
        `);

        const count = archiveQuery[0].count;
        console.log(`  归档查询结果: ${count} 个符合归档条件的学生`);

        if (count === 0) {
            console.log('\n💡 问题分析:');
            if (students.length === 0) {
                console.log('  ❌ 学生数据根本没有添加成功');
                console.log('  建议: 检查批量导入API的实现');
            } else {
                const activeCount = students.filter(s => s.status === 'active').length;
                if (activeCount === 0) {
                    console.log('  ❌ 学生数据添加了，但状态不是"active"');
                    console.log('  建议: 检查学生导入时的默认状态设置');
                    console.log('  当前状态值:', [...new Set(students.map(s => s.status))]);
                } else {
                    console.log('  ❓ 异常: 有活跃学生但查询结果为0，可能是SQL语法问题');
                }
            }
        }

    } catch (error) {
        console.error('❌ 查询失败:', error);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
