// 测试老师账号管理API
const baseUrl = 'http://localhost:3000';

// 测试获取老师列表
async function testGetTeachers() {
  try {
    const response = await fetch(`${baseUrl}/api/teachers`);
    const data = await response.json();
    console.log('获取老师列表:', data);
    return data;
  } catch (error) {
    console.error('获取老师列表失败:', error);
  }
}

// 测试创建老师账号
async function testCreateTeacher(username, password = '123456') {
  try {
    const response = await fetch(`${baseUrl}/api/teachers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    console.log('创建老师账号:', data);
    return data;
  } catch (error) {
    console.error('创建老师账号失败:', error);
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试老师账号管理API...');
  
  // 先获取现有老师列表
  await testGetTeachers();
  
  // 创建一个测试老师账号
  await testCreateTeacher('test_teacher_001');
  
  // 再次获取老师列表，查看是否添加成功
  await testGetTeachers();
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  const fetch = require('node-fetch');
  runTests();
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
  window.testTeacherAPI = { testGetTeachers, testCreateTeacher, runTests };
}
