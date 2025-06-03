#!/usr/bin/env node
const axios = require('axios');

console.log('🚀 开始极端并发冲突测试');

async function simpleTest() {
  try {
    console.log('🔐 尝试管理员登录...');
      const loginResponse = await axios.post('http://localhost:3000/api/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ 登录成功');
    const adminToken = loginResponse.data.token;
    
    // 创建测试学生
    console.log('👨‍🎓 创建测试学生...');
    const studentId = `simple_test_${Date.now()}`;
      const studentData = {
      students: [
        {
          id: studentId,
          name: '简单测试学生',
          grade: '2025',
          class: '测试班级'
        }
      ]
    };

    await axios.post(
      'http://localhost:3000/api/admin/import',
      studentData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log(`✅ 学生创建成功: ${studentId}`);
    
    // 进行简单的并发测试
    console.log('⚡ 开始并发测试 - 同时发起10个分值修改请求...');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {      const promise = axios.post(
        'http://localhost:3000/api/admin/score',
        {
          student_id: studentId,
          delta: 1,
          reason: `简单测试${i}`,
          operator: 'admin'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      ).then(response => {
        console.log(`✅ 请求${i}: 成功`);
        return { success: true, index: i };
      }).catch(error => {
        console.log(`❌ 请求${i}: 失败 - ${error.response?.data?.message || error.message}`);
        return { success: false, index: i, error: error.message };
      });
      
      promises.push(promise);
    }
    
    console.log('⏳ 等待所有请求完成...');
    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 测试结果:');
    console.log(`   成功: ${successful}/10`);
    console.log(`   失败: ${failed}/10`);
    console.log(`   成功率: ${(successful/10*100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ 失败详情:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   请求${r.index}: ${r.error}`);
      });
      console.log('\n🎉 成功检测到冲突！');
    } else {
      console.log('\n⚠️ 未检测到冲突 - 所有操作都成功了');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
}

console.log('开始执行简单测试...');
simpleTest().then(() => {
  console.log('👋 测试完成');
}).catch(error => {
  console.error('💥 未捕获的错误:', error);
});
