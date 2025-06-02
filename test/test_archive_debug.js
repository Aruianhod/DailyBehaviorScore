const testArchiveFunction = async () => {
  console.log('🔧 开始测试归档功能...');
  
  try {
    // 1. 检查后端API是否正常
    console.log('1. 检查归档统计API...');
    const statsResponse = await fetch('/api/admin/archive/stats');
    if (!statsResponse.ok) {
      throw new Error(`归档统计API错误: ${statsResponse.status}`);
    }
    const statsData = await statsResponse.json();
    console.log('✅ 归档统计API正常:', statsData);
    
    // 2. 检查归档历史API
    console.log('2. 检查归档历史API...');
    const logsResponse = await fetch('/api/admin/archive/logs');
    if (!logsResponse.ok) {
      throw new Error(`归档历史API错误: ${logsResponse.status}`);
    }
    const logsData = await logsResponse.json();
    console.log('✅ 归档历史API正常:', logsData);
    
    // 3. 如果API正常，问题可能在前端
    console.log('3. API检查完成，问题可能在前端组件...');
    console.log('📝 建议检查项：');
    console.log('   - AdminDashboard组件的state管理');
    console.log('   - ArchiveManagement组件的导入');
    console.log('   - React渲染逻辑');
    console.log('   - 浏览器控制台错误信息');
    
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
};

// 执行测试
testArchiveFunction();
