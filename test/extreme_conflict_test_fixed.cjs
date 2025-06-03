#!/usr/bin/env node
const axios = require('axios');

// 极端并发冲突测试 - 专门设计来触发冲突检测
class ExtremeConflictTester {
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

  async createTestStudent() {
    const studentData = {
      students: [
        {
          id: `extreme_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: '极端测试学生',
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

  // 测试1: 极短时间间隔的并发操作（毫秒级）
  async testMillisecondConcurrency() {
    console.log('\n🎯 测试1: 毫秒级并发分值修改');
    console.log('================================');
    
    const promises = [];
    const startTime = Date.now();
    
    // 同时发起20个请求，修改同一字段
    for (let i = 0; i < 20; i++) {
      const promise = axios.post(
        `${this.backendUrl}/api/admin/score`,
        {
          student_id: this.testStudentId,
          delta: 1,
          reason: `极端测试修改${i}`,
          operator: 'admin'
        },
        {
          headers: { Authorization: `Bearer ${this.adminToken}` }
        }
      ).then(response => ({
        success: true,
        index: i,
        data: response.data
      })).catch(error => ({
        success: false,
        index: i,
        error: error.response?.data || error.message
      }));
      
      promises.push(promise);
    }

    console.log('⚡ 发起20个并发请求...');
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`⏱️ 执行时间: ${endTime - startTime}ms`);
    console.log(`📊 结果: 成功 ${successful}, 失败 ${failed}`);
    
    if (failed > 0) {
      console.log('❌ 失败详情:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   请求${r.index}: ${r.error}`);
      });
    }
    
    return { successful, failed, totalTime: endTime - startTime };
  }

  // 测试2: 直接测试Paxos一致性检查的并发冲突
  async testPaxosDirectConflict() {
    console.log('\n🎯 测试2: Paxos直接并发冲突检测');
    console.log('=================================');
    
    const operation = {
      studentId: this.testStudentId,
      oldScore: 100,
      newScore: 101,
      changeReason: '测试冲突',
      operatorId: 'admin',
      timestamp: Date.now()
    };

    const promises = [];
    const startTime = Date.now();
    
    // 同时向Paxos发起50个相同操作的一致性检查
    for (let i = 0; i < 50; i++) {
      const promise = axios.post(
        `${this.paxosUrl}/consistency/score-change`,
        {
          ...operation,
          operationId: `extreme_${i}_${Date.now()}`
        }
      ).then(response => ({
        success: true,
        index: i,
        data: response.data
      })).catch(error => ({
        success: false,
        index: i,
        error: error.response?.data || error.message
      }));
      
      promises.push(promise);
    }

    console.log('⚡ 向Paxos发起50个并发一致性检查...');
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.success).length;
    const rejected = results.filter(r => !r.success).length;
    const allowed = results.filter(r => r.success && r.data?.data?.consensusAchieved).length;
    
    console.log(`⏱️ 执行时间: ${endTime - startTime}ms`);
    console.log(`📊 结果: 成功 ${successful}, 被拒绝 ${rejected}, 达成共识 ${allowed}`);
    
    if (rejected > 0) {
      console.log('🚫 被拒绝的请求:');
      results.filter(r => !r.success).slice(0, 5).forEach(r => {
        console.log(`   请求${r.index}: ${r.error}`);
      });
    }
    
    return { successful, rejected, allowed, totalTime: endTime - startTime };
  }

  // 测试3: 极端频率的操作序列
  async testExtremeFrequency() {
    console.log('\n🎯 测试3: 极端频率操作序列');
    console.log('============================');
    
    const results = [];
    const startTime = Date.now();
    
    console.log('🔄 执行100次快速连续操作...');
    
    for (let i = 0; i < 100; i++) {
      try {
        const response = await axios.post(
          `${this.backendUrl}/api/admin/score`,
          {
            student_id: this.testStudentId,
            delta: i % 2 === 0 ? 1 : -1, // 交替加减
            reason: `极端频率测试${i}`,
            operator: 'admin'
          },
          {
            headers: { Authorization: `Bearer ${this.adminToken}` }
          }
        );
        
        results.push({ success: true, index: i });
        
        // 极短延迟（1毫秒）
        await new Promise(resolve => setTimeout(resolve, 1));
        
      } catch (error) {
        results.push({ 
          success: false, 
          index: i, 
          error: error.response?.data || error.message 
        });
      }
      
      // 每10次操作显示进度
      if ((i + 1) % 20 === 0) {
        process.stdout.write(`${i + 1}/100... `);
      }
    }
    
    const endTime = Date.now();
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n⏱️ 总执行时间: ${endTime - startTime}ms`);
    console.log(`📊 平均操作时间: ${(endTime - startTime) / 100}ms`);
    console.log(`📊 结果: 成功 ${successful}, 失败 ${failed}`);
    console.log(`📊 成功率: ${(successful / 100 * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('❌ 失败样本:');
      results.filter(r => !r.success).slice(0, 3).forEach(r => {
        console.log(`   操作${r.index}: ${r.error}`);
      });
    }
    
    return { successful, failed, totalTime: endTime - startTime };
  }

  // 测试4: 多字段同时冲突
  async testMultiFieldConflict() {
    console.log('\n🎯 测试4: 多字段并发冲突');
    console.log('=========================');
    
    const fields = ['moral', 'intellectual', 'physical', 'aesthetic', 'labor'];
    const promises = [];
    const startTime = Date.now();
    
    // 为每个字段同时发起10个修改请求
    fields.forEach(field => {
      for (let i = 0; i < 10; i++) {
        const promise = axios.post(
          `${this.backendUrl}/api/admin/score`,
          {
            student_id: this.testStudentId,
            delta: 1,
            reason: `${field}字段冲突测试${i}`,
            operator: 'admin'
          },
          {
            headers: { Authorization: `Bearer ${this.adminToken}` }
          }
        ).then(response => ({
          success: true,
          field: field,
          index: i,
          data: response.data
        })).catch(error => ({
          success: false,
          field: field,
          index: i,
          error: error.response?.data || error.message
        }));
        
        promises.push(promise);
      }
    });

    console.log('⚡ 发起50个多字段并发请求...');
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`⏱️ 执行时间: ${endTime - startTime}ms`);
    console.log(`📊 结果: 成功 ${successful}, 失败 ${failed}`);
    
    // 按字段统计
    fields.forEach(field => {
      const fieldResults = results.filter(r => r.field === field);
      const fieldSuccess = fieldResults.filter(r => r.success).length;
      console.log(`   ${field}: ${fieldSuccess}/10 成功`);
    });
    
    return { successful, failed, totalTime: endTime - startTime };
  }

  async runAllTests() {
    try {
      console.log('🚀 极端并发冲突测试');
      console.log('==================');
      
      await this.init();
      await this.createTestStudent();
      
      const test1 = await this.testMillisecondConcurrency();
      const test2 = await this.testPaxosDirectConflict();
      const test3 = await this.testExtremeFrequency();
      const test4 = await this.testMultiFieldConflict();
      
      console.log('\n📋 极端测试总结报告');
      console.log('==================');
      console.log(`🎯 测试1 - 毫秒级并发: 成功率 ${(test1.successful/(test1.successful + test1.failed)*100).toFixed(1)}%`);
      console.log(`🎯 测试2 - Paxos冲突: 成功率 ${(test2.successful/(test2.successful + test2.rejected)*100).toFixed(1)}%`);
      console.log(`🎯 测试3 - 极端频率: 成功率 ${(test3.successful/(test3.successful + test3.failed)*100).toFixed(1)}%`);
      console.log(`🎯 测试4 - 多字段冲突: 成功率 ${(test4.successful/(test4.successful + test4.failed)*100).toFixed(1)}%`);
      
      const totalOperations = test1.successful + test1.failed + test2.successful + test2.rejected + 
                             test3.successful + test3.failed + test4.successful + test4.failed;
      const totalConflicts = test1.failed + test2.rejected + test3.failed + test4.failed;
      
      console.log(`\n🔥 整体统计:`);
      console.log(`   总操作数: ${totalOperations}`);
      console.log(`   检测到冲突/失败: ${totalConflicts}`);
      console.log(`   冲突检测率: ${(totalConflicts/totalOperations*100).toFixed(2)}%`);
      
      if (totalConflicts > 0) {
        console.log('\n✅ 成功触发了冲突检测机制！');
      } else {
        console.log('\n⚠️ 未能触发明显冲突 - 系统处理能力很强或配置为高容错模式');
      }
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error.message);
    } finally {
      console.log('\n👋 极端测试完成');
    }
  }
}

// 执行测试
if (require.main === module) {
  const tester = new ExtremeConflictTester();
  tester.runAllTests();
}

module.exports = ExtremeConflictTester;
