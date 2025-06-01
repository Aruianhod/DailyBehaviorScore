const fetch = require('node-fetch');

async function testAPIFixes() {
  console.log('🧪 开始测试API修复效果...\n');
  
  try {
    // 1. 测试学生端分值记录API
    console.log('1️⃣ 测试学生端分值记录API');
    const studentResponse = await fetch('http://localhost:3000/api/student/score-records?student_id=2023001');
    const studentData = await studentResponse.json();
    console.log('学生端API响应:', JSON.stringify(studentData, null, 2));
    
    if (studentData.records && studentData.records.length > 0) {
      const record = studentData.records[0];
      console.log('✅ 时间字段:', record.date || record.created_at || '无');
      console.log('✅ 操作人字段:', record.reviewer || record.operator || '无');
    }
    console.log('');
    
    // 2. 测试老师端历史申请API
    console.log('2️⃣ 测试老师端历史申请API');
    const teacherResponse = await fetch('http://localhost:3000/api/teacher/applications/history?teacher=teacher1');
    const teacherData = await teacherResponse.json();
    console.log('老师端API响应:', JSON.stringify(teacherData, null, 2));
    
    if (teacherData.applications && teacherData.applications.length > 0) {
      const app = teacherData.applications[0];
      console.log('✅ 时间字段:', app.date || app.created_at || '无');
      console.log('✅ 处理人字段:', app.reviewer || app.operator || '无');
      console.log('✅ 状态字段:', app.status || '无');
    }
    console.log('');
    
    // 3. 测试管理员端学生记录API
    console.log('3️⃣ 测试管理员端学生记录API');
    const adminResponse = await fetch('http://localhost:3000/api/admin/score-records/2023001');
    const adminData = await adminResponse.json();
    console.log('管理员端API响应:', JSON.stringify(adminData, null, 2));
    
    if (adminData.records && adminData.records.length > 0) {
      const record = adminData.records[0];
      console.log('✅ 时间字段:', record.date || record.created_at || '无');
      console.log('✅ 操作人字段:', record.reviewer || record.operator || '无');
    }
    console.log('');
    
    // 4. 测试管理员端待审核申请API
    console.log('4️⃣ 测试管理员端待审核申请API');
    const pendingResponse = await fetch('http://localhost:3000/api/admin/applications');
    const pendingData = await pendingResponse.json();
    console.log('待审核申请API响应:', JSON.stringify(pendingData, null, 2));
    console.log('');
    
    console.log('🎉 API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

testAPIFixes();
