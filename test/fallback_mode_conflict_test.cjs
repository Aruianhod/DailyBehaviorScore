#!/usr/bin/env node
const axios = require('axios');

// 极端并发冲突测试 - 检查fallbackMode对冲突检测的影响
class FallbackModeConflictTester {
  constructor() {
    this.backendUrl = 'http://localhost:3000';
    this.paxosUrl = 'http://localhost:3002';
    this.adminToken = null;
    this.testStudentId = null;
  }

  async init() {
    console.log('🔐 管理员登录...');
    const loginResponse = await axios.post(`${this.backendUrl}/api/login`, {
      username: 'admin',
      password: 'admin123'
    });
    this.adminToken = loginResponse.data.token;
    console.log('✅ 登录成功');
  }
  
  async checkPaxosConfig() {
    console.log('🔍 检查当前Paxos配置...');
    try {
      const response = await axios.get(`${this.backendUrl}/api/admin/paxos-status`);
      console.log('⚙️ 当前Paxos配置:');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log('⚠️ 无法获取Paxos配置:', error.message);
      return null;
    }
  }

  async createTestStudent() {
    const studentData = {
      students: [
        {
          id: `fallback_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: 'Fallback模式测试学生',
          grade: '2025',
          class: '测试班级'
        }
      ]
    };

    const response = await axios.post(
      `${this.backendUrl}/api/admin/import`,
      studentData,
      {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      }
    );
    this.testStudentId = studentData.students[0].id;
    console.log(`👨‍🎓 创建测试学生: ${this.testStudentId}`);
    return this.testStudentId;
  }

  // 测试直接向Paxos服务发送请求以验证冲突检测逻辑
  async testDirectPaxosConflictDetection() {
    console.log('\n🧪 测试1: 直接测试Paxos冲突检测逻辑');
    console.log('===================================');
    
    const operation1 = {
      studentId: this.testStudentId,
      oldScore: 100,
      newScore: 110,
      changeReason: '测试操作1',
      operatorId: 'admin1',
      timestamp: Date.now()
    };
    
    console.log('1️⃣ 发送第一个请求...');
    const response1 = await axios.post(
      `${this.paxosUrl}/consistency/score-change`,
      operation1
    );
    
    console.log(`✅ 第一个请求响应: ${response1.data.success ? '成功' : '失败'}`);
    
    // 使用相同的学生ID立即发送第二个请求
    const operation2 = {
      ...operation1,
      operatorId: 'admin2',
      changeReason: '测试操作2',
      timestamp: Date.now()
    };
    
    console.log('2️⃣ 立即发送第二个请求（应触发冲突）...');
    try {
      const response2 = await axios.post(
        `${this.paxosUrl}/consistency/score-change`,
        operation2
      );
      
      console.log(`响应状态: ${response2.data.success ? '成功' : '失败'}`);
      console.log(`冲突检测: ${response2.data.data?.conflict ? '✓ 检测到冲突' : '✗ 未检测到冲突'}`);
      
      if (response2.data.data?.conflict) {
        console.log('冲突详情:');
        console.log(JSON.stringify(response2.data.data.conflictDetails, null, 2));
      }
      
      return { 
        success: true,
        conflictDetected: response2.data.data?.conflict === true,
        details: response2.data.data
      };
      
    } catch (error) {
      console.log('❌ 第二个请求失败:');
      console.log(error.message);
      return { 
        success: false,
        error: error.message
      };
    }
  }

  // 测试服务器API如何处理冲突
  async testApiConflictHandling() {
    console.log('\n🧪 测试2: API层的冲突处理');
    console.log('===========================');
    
    console.log('1️⃣ 发送第一个API请求...');
    const response1 = await axios.post(
      `${this.backendUrl}/api/admin/score`,
      {
        student_id: this.testStudentId,
        delta: 5,
        reason: 'API测试1',
        operator: 'admin1'
      },
      {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      }
    );
    
    console.log(`✅ 第一个API请求响应: ${response1.data.message}`);
    
    // 立即发送第二个请求
    console.log('2️⃣ 立即发送第二个API请求（应触发冲突）...');
    try {
      const response2 = await axios.post(
        `${this.backendUrl}/api/admin/score`,
        {
          student_id: this.testStudentId,
          delta: -3,
          reason: 'API测试2',
          operator: 'admin2'
        },
        {
          headers: { Authorization: `Bearer ${this.adminToken}` }
        }
      );
      
      console.log(`✅ 第二个API请求响应: ${response2.data.message}`);
      console.log('注意: 如果这个请求成功，那么fallbackMode可能设置为允许模式');
      
      return { 
        success: true,
        secondRequestAllowed: true,
        message: response2.data.message
      };
      
    } catch (error) {
      console.log('❌ 第二个API请求失败:');
      if (error.response && error.response.status === 409) {
        console.log('✅ 预期的冲突被正确拒绝 (HTTP 409)');
        console.log(`冲突原因: ${error.response.data.message}`);
        return {
          success: true,
          secondRequestAllowed: false,
          conflictMessage: error.response.data.message
        };
      } else {
        console.log(error.message);
        return { 
          success: false,
          error: error.message
        };
      }
    }
  }

  async runTests() {
    try {
      console.log('🚀 Fallback模式冲突测试');
      console.log('=====================');
      
      await this.init();
      const config = await this.checkPaxosConfig();
      await this.createTestStudent();
      
      // 测试Paxos冲突检测逻辑
      const test1 = await this.testDirectPaxosConflictDetection();
      
      // 测试API层的冲突处理
      const test2 = await this.testApiConflictHandling();
      
      console.log('\n📋 测试结果总结');
      console.log('===============');
      console.log(`1. Paxos冲突检测: ${test1.conflictDetected ? '✅ 正常工作' : '❌ 未检测到冲突'}`);
      console.log(`2. API冲突处理: ${test2.secondRequestAllowed ? '⚠️ 允许有冲突的操作 (fallback mode)' : '✅ 正确拒绝冲突'}`);
      
      console.log('\n🔍 诊断结果:');
      if (test1.conflictDetected && test2.secondRequestAllowed) {
        console.log('✅ 检测到问题: Paxos能正确检测冲突，但API层允许冲突操作执行');
        console.log('⚠️ 这表明fallbackMode可能设置为"allow"，导致即使检测到冲突也会允许操作执行');
        console.log('📝 建议解决方案:');
        console.log('1. 修改server.cjs中的fallbackMode设置为"deny"');
        console.log('2. 确保PaxosIntegration.cjs中正确处理冲突响应');
      } else if (!test1.conflictDetected) {
        console.log('❌ 检测到问题: Paxos冲突检测机制不工作');
        console.log('📝 建议解决方案:');
        console.log('1. 检查DistributedConsistencyService.cjs中的detectScoreChangeConflict方法');
        console.log('2. 检查conflictThreshold设置 (当前可能太大)');
      } else {
        console.log('✅ 系统工作正常: Paxos检测冲突，API层拒绝冲突操作');
      }
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error.message);
    } finally {
      console.log('\n👋 Fallback模式测试完成');
    }
  }
}

// 执行测试
if (require.main === module) {
  const tester = new FallbackModeConflictTester();
  tester.runTests().catch(console.error);
}

module.exports = FallbackModeConflictTester;
