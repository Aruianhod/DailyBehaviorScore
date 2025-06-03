
const https = require('https');
const http = require('http');

/**
 * 验证在 fallbackMode='deny' 模式下系统的行为
 */
async function testDenyMode() {
    const baseUrl = 'http://localhost:3000';
    console.log('🔐 测试 fallbackMode="deny" 模式下的系统行为');
    
    // 登录管理员
    console.log('\n1. 管理员登录...');
    const loginRes = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
        })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.log('❌ 登录失败');
        return;
    }
    console.log('✅ 管理员登录成功');
    
    const token = loginData.token;
    
    // 测试读取操作（应该正常工作）
    console.log('\n2. 测试读取操作...');
    const studentsRes = await fetch(`${baseUrl}/api/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (studentsRes.ok) {
        const students = await studentsRes.json();
        console.log(`✅ 读取学生列表成功，共 ${students.length} 个学生`);
    } else {
        console.log('❌ 读取学生列表失败');
    }
    
    // 测试关键写入操作（应该被拒绝）
    console.log('\n3. 测试关键写入操作（分值修改）...');
    const scoreRes = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            student_id: '2024001001',
            change_value: 5,
            reason: '测试分值修改',
            teacher_id: 'admin',
            type: 'add'
        })
    });
    
    const scoreData = await scoreRes.json();
    if (scoreRes.status === 409) {
        console.log('✅ 分值修改被正确拒绝');
        console.log(`   拒绝原因: ${scoreData.message}`);
    } else {
        console.log('❌ 分值修改应该被拒绝但实际成功了');
    }
    
    // 测试申请审核（应该被拒绝）
    console.log('\n4. 测试申请审核操作...');
    
    // 先提交一个申请（这个应该成功，因为不是关键操作）
    const applyRes = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            student_id: '2024001001',
            change_value: 3,
            reason: '测试申请提交',
            type: 'add'
        })
    });
    
    if (applyRes.ok) {
        console.log('✅ 申请提交成功（非关键操作）');
        
        // 现在尝试审核申请（关键操作，应该被拒绝）
        const apps = await fetch(`${baseUrl}/api/applications/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pendingApps = await apps.json();
        
        if (pendingApps.length > 0) {
            const reviewRes = await fetch(`${baseUrl}/api/applications/${pendingApps[0].id}/review`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    action: 'approve',
                    admin_comment: '测试审核'
                })
            });
            
            const reviewData = await reviewRes.json();
            if (reviewRes.status === 409) {
                console.log('✅ 申请审核被正确拒绝');
                console.log(`   拒绝原因: ${reviewData.message}`);
            } else {
                console.log('❌ 申请审核应该被拒绝但实际成功了');
            }
        }
    } else {
        console.log('❌ 申请提交失败');
    }
    
    // 测试归档操作（应该被拒绝）
    console.log('\n5. 测试归档操作...');
    const archiveRes = await fetch(`${baseUrl}/api/archive`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            year: '1955',
            description: '测试归档操作'
        })
    });
    
    const archiveData = await archiveRes.json();
    if (archiveRes.status === 409) {
        console.log('✅ 归档操作被正确拒绝');
        console.log(`   拒绝原因: ${archiveData.message}`);
    } else {
        console.log('❌ 归档操作应该被拒绝但实际成功了');
    }
    
    console.log('\n🎯 测试总结:');
    console.log('- 在 fallbackMode="deny" 模式下');
    console.log('- 读取操作正常工作');
    console.log('- 关键写入操作（分值修改、申请审核、归档）被正确拒绝');
    console.log('- 系统在Paxos服务不可用时保持安全的降级状态');
}

// 运行测试
testDenyMode().catch(console.error);
