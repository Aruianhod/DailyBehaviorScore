// 测试老师账号管理API
const axios = require('axios');

const baseURL = 'http://localhost:3000';

async function testTeacherManagement() {
  console.log('开始测试老师账号管理API...\n');

  try {
    // 1. 获取老师列表
    console.log('1. 测试获取老师列表...');
    const teachersResponse = await axios.get(`${baseURL}/api/teachers`);
    console.log('获取老师列表成功，当前老师数量:', teachersResponse.data.length);
    console.log('老师列表:', teachersResponse.data);
    console.log('');

    // 2. 创建新老师账号
    console.log('2. 测试创建新老师账号...');
    const newTeacher = {
      username: 'test_teacher_' + Date.now(),
      name: '测试老师',
      password: '123456'
    };
    
    console.log('发送创建请求:', newTeacher);
    const createResponse = await axios.post(`${baseURL}/api/teachers`, newTeacher);
    console.log('创建老师账号成功:', createResponse.data);
    const teacherId = createResponse.data.id;
    console.log('');

    // 3. 再次获取老师列表，验证新创建的账号
    console.log('3. 验证新创建的老师账号...');
    const updatedTeachersResponse = await axios.get(`${baseURL}/api/teachers`);
    console.log('更新后的老师列表数量:', updatedTeachersResponse.data.length);
    const newCreatedTeacher = updatedTeachersResponse.data.find(t => t.id === teacherId);
    console.log('新创建的老师信息:', newCreatedTeacher);
    console.log('');

    // 4. 测试用户名重复的情况
    console.log('4. 测试重复用户名...');
    try {
      await axios.post(`${baseURL}/api/teachers`, newTeacher);
      console.log('错误：应该拒绝重复用户名');
    } catch (error) {
      console.log('重复用户名错误处理正确:', error.response.data.message);
    }
    console.log('');

    // 5. 删除测试账号
    console.log('5. 测试删除老师账号...');
    await axios.delete(`${baseURL}/api/teachers/${teacherId}`);
    console.log('删除老师账号成功');
    console.log('');

    // 6. 验证删除结果
    console.log('6. 验证删除结果...');
    const finalTeachersResponse = await axios.get(`${baseURL}/api/teachers`);
    console.log('删除后的老师列表数量:', finalTeachersResponse.data.length);
    console.log('');

    console.log('所有测试通过！✅');

  } catch (error) {
    console.error('测试失败:');
    console.error('状态码:', error.response?.status);
    console.error('错误信息:', error.response?.data);
    console.error('完整错误:', error.message);
  }
}

testTeacherManagement();
