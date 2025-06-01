// 测试API脚本
const fetch = require('node-fetch');

// 测试学生列表API
async function testStudentList() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/students');
    const data = await response.json();
    console.log('学生列表API测试:');
    console.log('状态:', response.status);
    console.log('学生数量:', data.students?.length || 0);
    if (data.students?.length > 0) {
      console.log('第一个学生:', data.students[0]);
    }
  } catch (error) {
    console.error('学生列表API错误:', error.message);
  }
}

// 测试分值记录API
async function testScoreRecords() {
  try {
    const response = await fetch('http://localhost:3000/api/student/score-records?student_id=2022211014');
    const data = await response.json();
    console.log('\n分值记录API测试:');
    console.log('状态:', response.status);
    console.log('记录数量:', data.records?.length || 0);
    if (data.records?.length > 0) {
      console.log('第一条记录:', data.records[0]);
    }
  } catch (error) {
    console.error('分值记录API错误:', error.message);
  }
}

// 运行测试
async function runTests() {
  await testStudentList();
  await testScoreRecords();
}

runTests();
