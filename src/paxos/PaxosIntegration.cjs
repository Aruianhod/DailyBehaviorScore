/**
 * Paxos集成模块 - 供主服务器集成使用
 * 提供简单的API接口来使用Paxos一致性检测服务
 */

const axios = require('axios');
const { checkPortAvailable } = require('./utils/portUtils.cjs');

class PaxosIntegration {
  constructor(options = {}) {
    this.defaultPort = options.port || 3002;
    this.actualPort = null;
    this.portSearchRange = options.portSearchRange || 10;
    this.baseURL = null;
    this.timeout = options.timeout || 5000;
    this.enabled = options.enabled !== false; // 默认启用
    this.fallbackMode = options.fallbackMode || 'allow'; // 'allow' | 'deny'
    this.client = null;
    
    console.log(`[PaxosIntegration] 初始化完成 - 默认端口: ${this.defaultPort}, 启用状态: ${this.enabled}`);
  }
  /**
   * 自动发现Paxos服务端口并初始化客户端
   */
  async discoverAndInitialize() {
    if (!this.enabled) return false;

    try {
      console.log(`[PaxosIntegration] 开始自动发现Paxos服务端口...`);
      
      // 从默认端口开始搜索可用的Paxos服务
      for (let i = 0; i < this.portSearchRange; i++) {
        const port = this.defaultPort + i;
        
        try {
          // 直接尝试连接到该端口的Paxos服务
          const testURL = `http://localhost:${port}`;
          console.log(`[PaxosIntegration] 🔍 尝试连接端口 ${port}...`);
          
          const response = await axios.get(`${testURL}/health`, { 
            timeout: 2000,
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.data && response.data.status === 'healthy') {
            this.actualPort = port;
            this.baseURL = testURL;
            
            this.client = axios.create({
              baseURL: this.baseURL,
              timeout: this.timeout,
              headers: {
                'Content-Type': 'application/json'
              }
            });

            console.log(`[PaxosIntegration] ✅ 发现Paxos服务在端口 ${port}`);
            if (port !== this.defaultPort) {
              console.log(`[PaxosIntegration] 🔄 端口切换: ${this.defaultPort} -> ${port}`);
            }
            return true;
          }
        } catch (error) {
          // 该端口没有Paxos服务或连接失败，继续搜索
          console.log(`[PaxosIntegration] ⚠️  端口 ${port}: ${error.code || error.message}`);
          continue;
        }
      }
      
      console.warn(`[PaxosIntegration] ⚠️  在端口范围 ${this.defaultPort}-${this.defaultPort + this.portSearchRange - 1} 内未找到Paxos服务`);
      return false;
    } catch (error) {
      console.error('[PaxosIntegration] 自动发现服务失败:', error.message);
      return false;
    }
  }
  /**
   * 检查Paxos服务是否可用
   */
  async isServiceAvailable() {
    if (!this.enabled) return false;
    
    // 如果还没有初始化客户端，先尝试发现服务
    if (!this.client) {
      const discovered = await this.discoverAndInitialize();
      if (!discovered) return false;
    }
    
    try {
      const response = await this.client.get('/health', { timeout: 2000 });
      return response.data.status === 'healthy';
    } catch (error) {
      console.warn('[PaxosIntegration] Paxos服务不可用:', error.message);
      // 服务可能重启了，尝试重新发现
      this.client = null;
      this.actualPort = null;
      this.baseURL = null;
      return false;
    }
  }
  /**
   * 确保服务连接可用的内部方法
   */
  async ensureServiceConnection() {
    if (!this.enabled) return false;
    
    if (!this.client) {
      return await this.discoverAndInitialize();
    }
    return true;
  }

  /**
   * 检查分值修改操作的一致性
   * @param {Object} scoreChangeData - 分值修改数据
   * @param {string} scoreChangeData.studentId - 学生ID
   * @param {string} scoreChangeData.teacherId - 老师ID
   * @param {number} scoreChangeData.change - 分值变化
   * @param {string} scoreChangeData.reason - 修改原因
   * @returns {Promise<Object>} 一致性检查结果
   */
  async checkScoreChangeConsistency(scoreChangeData) {
    if (!this.enabled) {
      return { allowed: true, reason: 'Paxos检测已禁用' };
    }

    // 确保服务连接可用
    const connected = await this.ensureServiceConnection();
    if (!connected) {
      return this.fallbackMode === 'allow' 
        ? { allowed: true, reason: 'Paxos服务不可用，允许操作' }
        : { allowed: false, reason: 'Paxos服务不可用，拒绝操作' };
    }

    try {
      const response = await this.client.post('/consistency/score-change', scoreChangeData);
      
      if (response.data.success) {
        return {
          allowed: true,
          operationId: response.data.data.operationId,
          consensusAchieved: response.data.data.consensusAchieved
        };
      } else {
        return {
          allowed: false,
          reason: response.data.message || '一致性检查失败'
        };
      }
    } catch (error) {
      console.error('[PaxosIntegration] 分值修改一致性检查失败:', error.message);
      
      // 根据fallback策略决定是否允许操作
      return {
        allowed: this.fallbackMode === 'allow',
        reason: `Paxos服务异常，采用${this.fallbackMode === 'allow' ? '允许' : '拒绝'}策略`
      };
    }
  }
  /**
   * 检查申请审核操作的一致性
   * @param {Object} reviewData - 审核数据
   * @param {string} reviewData.applicationId - 申请ID
   * @param {string} reviewData.reviewerId - 审核者ID
   * @param {string} reviewData.action - 操作类型 ('approve' | 'reject')
   * @returns {Promise<Object>} 一致性检查结果
   */
  async checkApplicationReviewConsistency(reviewData) {
    if (!this.enabled) {
      return { allowed: true, reason: 'Paxos检测已禁用' };
    }

    // 确保服务连接可用
    const connected = await this.ensureServiceConnection();
    if (!connected) {
      return this.fallbackMode === 'allow' 
        ? { allowed: true, reason: 'Paxos服务不可用，允许操作' }
        : { allowed: false, reason: 'Paxos服务不可用，拒绝操作' };
    }

    try {
      const response = await this.client.post('/consistency/application-review', reviewData);
      
      if (response.data.success) {
        return {
          allowed: true,
          operationId: response.data.data.operationId,
          consensusAchieved: response.data.data.consensusAchieved
        };
      } else {
        return {
          allowed: false,
          reason: response.data.message || '一致性检查失败'
        };
      }
    } catch (error) {
      console.error('[PaxosIntegration] 申请审核一致性检查失败:', error.message);
      
      return {
        allowed: this.fallbackMode === 'allow',
        reason: `Paxos服务异常，采用${this.fallbackMode === 'allow' ? '允许' : '拒绝'}策略`
      };
    }
  }
  /**
   * 检查归档操作的一致性
   * @param {Object} archiveData - 归档数据
   * @param {string} archiveData.resourceType - 资源类型
   * @param {string} archiveData.resourceId - 资源ID
   * @param {string} archiveData.operatorId - 操作者ID
   * @param {string} archiveData.operation - 操作类型
   * @returns {Promise<Object>} 一致性检查结果
   */
  async checkArchiveConsistency(archiveData) {
    if (!this.enabled) {
      return { allowed: true, reason: 'Paxos检测已禁用' };
    }

    // 确保服务连接可用
    const connected = await this.ensureServiceConnection();
    if (!connected) {
      return this.fallbackMode === 'allow' 
        ? { allowed: true, reason: 'Paxos服务不可用，允许操作' }
        : { allowed: false, reason: 'Paxos服务不可用，拒绝操作' };
    }

    try {
      const response = await this.client.post('/consistency/archive', archiveData);
      
      if (response.data.success) {
        return {
          allowed: true,
          operationId: response.data.data.operationId,
          consensusAchieved: response.data.data.consensusAchieved
        };
      } else {
        return {
          allowed: false,
          reason: response.data.message || '一致性检查失败'
        };
      }
    } catch (error) {
      console.error('[PaxosIntegration] 归档操作一致性检查失败:', error.message);
      
      return {
        allowed: this.fallbackMode === 'allow',
        reason: `Paxos服务异常，采用${this.fallbackMode === 'allow' ? '允许' : '拒绝'}策略`
      };
    }
  }
  /**
   * 获取Paxos服务状态
   */
  async getServiceStatus() {
    if (!this.enabled) {
      return { status: 'disabled' };
    }

    // 确保服务连接可用
    const connected = await this.ensureServiceConnection();
    if (!connected) {
      return { status: 'unavailable', error: 'Paxos服务不可用' };
    }

    try {
      const response = await this.client.get('/status');
      return response.data.data;
    } catch (error) {
      console.error('[PaxosIntegration] 获取服务状态失败:', error.message);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * 强制同步Paxos网络
   */
  async forceSync() {
    if (!this.enabled) {
      return { success: false, reason: 'Paxos检测已禁用' };
    }

    // 确保服务连接可用
    const connected = await this.ensureServiceConnection();
    if (!connected) {
      return { success: false, reason: 'Paxos服务不可用' };
    }    try {
      const response = await this.client.post('/sync');
      return response.data;
    } catch (error) {
      console.error('[PaxosIntegration] 强制同步失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 设置集成参数
   */
  setOptions(options) {
    if (options.enabled !== undefined) {
      this.enabled = options.enabled;
    }
    if (options.fallbackMode) {
      this.fallbackMode = options.fallbackMode;
    }
    if (options.baseURL) {
      this.baseURL = options.baseURL;
      this.client.defaults.baseURL = options.baseURL;
    }
    if (options.timeout) {
      this.timeout = options.timeout;
      this.client.defaults.timeout = options.timeout;
    }

    console.log(`[PaxosIntegration] 参数已更新 - 启用: ${this.enabled}, 降级策略: ${this.fallbackMode}`);
  }  /**
   * 获取当前配置
   */
  getConfig() {
    return {
      defaultPort: this.defaultPort,
      actualPort: this.actualPort,
      baseURL: this.baseURL,
      timeout: this.timeout,
      enabled: this.enabled,
      fallbackMode: this.fallbackMode,
      portSwitched: this.actualPort && this.actualPort !== this.defaultPort
    };
  }

  /**
   * 获取端口信息
   */
  getPortInfo() {
    return {
      default: this.defaultPort,
      actual: this.actualPort,
      switched: this.actualPort && this.actualPort !== this.defaultPort,
      url: this.baseURL
    };
  }

  /**
   * 重新初始化服务连接
   */
  async reinitialize() {
    this.client = null;
    this.actualPort = null;
    this.baseURL = null;
    return await this.discoverAndInitialize();
  }
}

// 直接导出类，而不是对象
module.exports = PaxosIntegration;
