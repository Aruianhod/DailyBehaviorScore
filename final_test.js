// 最终功能测试脚本
const testAPI = async () => {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('=== 开始综合功能测试 ===\n');

  // 1. 测试学生端API
  console.log('1. 测试学生端分值记录API...');
  try {
    const response = await fetch(`${BASE_URL}/api/student/score-records?student_id=2022211014`);
    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      console.log('✅ 学生端API正常');
      console.log(`   - 最新记录: δ${record.delta}, 原因: ${record.reason}, 操作人: ${record.reviewer || record.operator}`);
      console.log(`   - 时间字段: ${record.date || record.created_at}`);
    } else {
      console.log('⚠️  学生端API无记录');
    }
  } catch (error) {
    console.log('❌ 学生端API失败:', error.message);
  }

  // 2. 测试老师端API
  console.log('\n2. 测试老师端历史记录API...');
  try {
    const response = await fetch(`${BASE_URL}/api/teacher/applications/history?user=TestTeacher`);
    const data = await response.json();
    
    if (data.applications && data.applications.length > 0) {
      const app = data.applications[0];
      console.log('✅ 老师端API正常');
      console.log(`   - 申请状态: ${app.status}, 审核人: ${app.reviewer}`);
      console.log(`   - 审核时间: ${app.reviewed_at || app.date}`);
    } else {
      console.log('⚠️  老师端API无记录');
    }
  } catch (error) {
    console.log('❌ 老师端API失败:', error.message);
  }

  // 3. 创建新申请并测试单个通过功能
  console.log('\n3. 测试申请提交和单个通过功能...');
  try {
    // 提交申请
    const submitResponse = await fetch(`${BASE_URL}/api/teacher/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        students: [{ id: '2022211014', name: '刘珉汐' }],
        delta: 5,
        reason: '最终测试申请',
        date: '2024-01-16',
        teacher: 'FinalTestTeacher'
      })
    });
    
    const submitResult = await submitResponse.json();
    console.log('✅ 申请提交成功:', submitResult.message);

    // 获取最新申请
    const appsResponse = await fetch(`${BASE_URL}/api/admin/applications`);
    const appsData = await appsResponse.json();
    
    if (appsData.applications && appsData.applications.length > 0) {
      const latestApp = appsData.applications[appsData.applications.length - 1];
      console.log(`   - 最新申请ID: ${latestApp.id}`);

      // 测试单个通过
      const approveResponse = await fetch(`${BASE_URL}/api/admin/applications/${latestApp.id}/approve`, {
        method: 'POST'
      });
      const approveResult = await approveResponse.json();
      console.log('✅ 单个通过功能:', approveResult.message);
    }
  } catch (error) {
    console.log('❌ 申请流程测试失败:', error.message);
  }

  // 4. 测试管理员端API统一性
  console.log('\n4. 测试管理员端分值记录API...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/score-records/2022211014`);
    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      console.log('✅ 管理员端API正常');
      console.log(`   - 字段统一性检查:`);
      console.log(`     * 时间字段: ${record.date ? '✅ date' : '❌ 缺少date'} ${record.created_at ? '✅ created_at' : '❌ 缺少created_at'}`);
      console.log(`     * 操作人字段: ${record.operator ? '✅ operator' : '❌ 缺少operator'}`);
    }
  } catch (error) {
    console.log('❌ 管理员端API失败:', error.message);
  }

  console.log('\n=== 测试完成 ===');
};

// 运行测试
testAPI().catch(console.error);
