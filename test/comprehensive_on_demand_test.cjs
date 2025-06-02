// 按需加载功能完整测试
const http = require('http');

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testOnDemandLoading() {
  console.log('🚀 开始按需加载功能完整测试\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  async function runTest(name, testFn) {
    try {
      console.log(`🧪 ${name}...`);
      const result = await testFn();
      console.log(`✅ ${name} - 通过`);
      if (result && result.details) {
        console.log(`   ${result.details}`);
      }
      results.passed++;
      results.tests.push({ name, status: 'passed', details: result?.details });
    } catch (error) {
      console.log(`❌ ${name} - 失败: ${error.message}`);
      results.failed++;
      results.tests.push({ name, status: 'failed', error: error.message });
    }
    console.log('');
  }

  // 测试1: 获取年级班级选项
  await runTest('获取年级班级选项API', async () => {
    const data = await makeRequest('http://localhost:3000/api/admin/class-options');
    
    if (!data.grades || !data.classes) {
      throw new Error('返回数据格式错误');
    }
    
    if (!Array.isArray(data.grades) || !Array.isArray(data.classes)) {
      throw new Error('grades或classes不是数组');
    }
    
    return {
      details: `获取到${data.grades.length}个年级，${data.classes.length}个班级`
    };
  });

  // 测试2: 获取所有学生（无筛选）
  await runTest('获取所有学生数据', async () => {
    const data = await makeRequest('http://localhost:3000/api/admin/students');
    
    if (!data.students || !Array.isArray(data.students)) {
      throw new Error('学生数据格式错误');
    }
    
    return {
      details: `获取到${data.students.length}名学生`
    };
  });

  // 测试3: 年级筛选功能
  await runTest('年级筛选功能', async () => {
    // 先获取可用年级
    const optionsData = await makeRequest('http://localhost:3000/api/admin/class-options');
    if (!optionsData.grades || optionsData.grades.length === 0) {
      throw new Error('没有可用的年级数据');
    }
    
    const testGrade = optionsData.grades[0];
    const filteredData = await makeRequest(`http://localhost:3000/api/admin/students?grade=${encodeURIComponent(testGrade)}`);
    
    if (!filteredData.students || !Array.isArray(filteredData.students)) {
      throw new Error('筛选后的数据格式错误');
    }
    
    // 验证所有返回的学生都属于指定年级
    const invalidStudents = filteredData.students.filter(s => s.grade != testGrade);
    if (invalidStudents.length > 0) {
      throw new Error(`发现${invalidStudents.length}个不符合年级筛选条件的学生`);
    }
    
    return {
      details: `${testGrade}级筛选结果: ${filteredData.students.length}名学生`
    };
  });

  // 测试4: 班级筛选功能
  await runTest('班级筛选功能', async () => {
    const optionsData = await makeRequest('http://localhost:3000/api/admin/class-options');
    if (!optionsData.classes || optionsData.classes.length === 0) {
      throw new Error('没有可用的班级数据');
    }
    
    const testClass = optionsData.classes[0];
    const filteredData = await makeRequest(`http://localhost:3000/api/admin/students?class=${encodeURIComponent(testClass)}`);
    
    if (!filteredData.students || !Array.isArray(filteredData.students)) {
      throw new Error('筛选后的数据格式错误');
    }
    
    // 验证所有返回的学生都属于指定班级
    const invalidStudents = filteredData.students.filter(s => s.class !== testClass);
    if (invalidStudents.length > 0) {
      throw new Error(`发现${invalidStudents.length}个不符合班级筛选条件的学生`);
    }
    
    return {
      details: `${testClass}班级筛选结果: ${filteredData.students.length}名学生`
    };
  });

  // 测试5: 双重筛选功能
  await runTest('年级+班级双重筛选功能', async () => {
    const optionsData = await makeRequest('http://localhost:3000/api/admin/class-options');
    
    const testGrade = optionsData.grades[0];
    const testClass = optionsData.classes[0];
    
    const filteredData = await makeRequest(`http://localhost:3000/api/admin/students?grade=${encodeURIComponent(testGrade)}&class=${encodeURIComponent(testClass)}`);
    
    if (!filteredData.students || !Array.isArray(filteredData.students)) {
      throw new Error('筛选后的数据格式错误');
    }
    
    // 验证所有返回的学生都符合双重筛选条件
    const invalidStudents = filteredData.students.filter(s => 
      s.grade != testGrade || s.class !== testClass
    );
    if (invalidStudents.length > 0) {
      throw new Error(`发现${invalidStudents.length}个不符合双重筛选条件的学生`);
    }
    
    return {
      details: `${testGrade}级${testClass}双重筛选结果: ${filteredData.students.length}名学生`
    };
  });

  // 测试6: 空筛选条件处理
  await runTest('空筛选条件处理', async () => {
    const data1 = await makeRequest('http://localhost:3000/api/admin/students?grade=');
    const data2 = await makeRequest('http://localhost:3000/api/admin/students?class=');
    const data3 = await makeRequest('http://localhost:3000/api/admin/students?grade=&class=');
    
    if (!data1.students || !data2.students || !data3.students) {
      throw new Error('空筛选条件处理失败');
    }
    
    // 这些应该返回所有学生
    const allStudentsData = await makeRequest('http://localhost:3000/api/admin/students');
    
    if (data1.students.length !== allStudentsData.students.length ||
        data2.students.length !== allStudentsData.students.length ||
        data3.students.length !== allStudentsData.students.length) {
      throw new Error('空筛选条件未正确处理为返回所有数据');
    }
    
    return {
      details: '空筛选条件正确处理为返回所有学生'
    };
  });

  // 测试7: 性能测试（响应时间）
  await runTest('API响应性能测试', async () => {
    const startTime = Date.now();
    
    // 并发请求测试
    const promises = [
      makeRequest('http://localhost:3000/api/admin/class-options'),
      makeRequest('http://localhost:3000/api/admin/students'),
      makeRequest('http://localhost:3000/api/admin/students?grade=2024'),
      makeRequest('http://localhost:3000/api/admin/students?class=1班')
    ];
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 5000) { // 5秒超时
      throw new Error(`响应时间过长: ${duration}ms`);
    }
    
    return {
      details: `4个并发请求总耗时: ${duration}ms`
    };
  });

  // 输出测试结果
  console.log('📊 测试结果汇总:');
  console.log(`✅ 通过: ${results.passed}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`📈 成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ 失败的测试:');
    results.tests.filter(t => t.status === 'failed').forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  console.log('\n🎯 按需加载功能测试完成!');
  
  return results;
}

// 运行测试
testOnDemandLoading().catch(console.error);
