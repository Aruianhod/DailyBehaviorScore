/**
 * Paxos管理器 - JavaScript版本
 * 管理Paxos节点和网络通信
 */

class PaxosManager {
  constructor(nodeId, options = {}) {
    this.nodeId = nodeId;
    this.nodes = new Map(); // 存储节点信息
    this.isLeader = false;
    this.currentProposalId = 0;
    this.proposalHistory = new Map();
    this.networkTimeout = options.networkTimeout || 5000;
    this.heartbeatInterval = options.heartbeatInterval || 2000;
    this.maxRetries = options.maxRetries || 3;
    this.isInitialized = false;
  }

  /**
   * 初始化Paxos网络
   */
  async initialize(nodeIds = []) {
    try {
      console.log(`[PaxosManager] 初始化节点 ${this.nodeId}`);
      
      // 初始化本地节点
      this.nodes.set(this.nodeId, {
        id: this.nodeId,
        status: 'active',
        lastHeartbeat: Date.now(),
        isLocal: true
      });

      // 添加其他节点
      for (const nodeId of nodeIds) {
        if (nodeId !== this.nodeId) {
          this.nodes.set(nodeId, {
            id: nodeId,
            status: 'unknown',
            lastHeartbeat: 0,
            isLocal: false
          });
        }
      }

      // 选举领导者（简化版本：第一个节点是领导者）
      this.electLeader();
      
      // 启动心跳机制
      this.startHeartbeat();
      
      this.isInitialized = true;
      console.log(`[PaxosManager] 节点 ${this.nodeId} 初始化完成，领导者: ${this.isLeader}`);
      
      return {
        success: true,
        nodeId: this.nodeId,
        isLeader: this.isLeader,
        totalNodes: this.nodes.size
      };
    } catch (error) {
      console.error(`[PaxosManager] 初始化失败:`, error);
      throw error;
    }
  }

  /**
   * 选举领导者（简化实现）
   */
  electLeader() {
    // 简化实现：按字典序选择第一个节点作为领导者
    const sortedNodeIds = Array.from(this.nodes.keys()).sort();
    const leaderId = sortedNodeIds[0];
    
    this.isLeader = (leaderId === this.nodeId);
    console.log(`[PaxosManager] 选举结果 - 领导者: ${leaderId}, 本节点是否为领导者: ${this.isLeader}`);
  }

  /**
   * 启动心跳机制
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
      this.checkNodeHealth();
    }, this.heartbeatInterval);
  }

  /**
   * 发送心跳
   */
  sendHeartbeat() {
    const heartbeatMsg = {
      type: 'heartbeat',
      nodeId: this.nodeId,
      timestamp: Date.now(),
      isLeader: this.isLeader
    };

    // 模拟发送心跳给其他节点
    for (const [nodeId, node] of this.nodes) {
      if (nodeId !== this.nodeId) {
        // 在实际实现中，这里应该通过网络发送心跳
        // 现在只是更新本地状态
        this.simulateHeartbeatResponse(nodeId);
      }
    }
  }

  /**
   * 模拟心跳响应（用于单节点测试）
   */
  simulateHeartbeatResponse(nodeId) {
    const node = this.nodes.get(nodeId);
    if (node) {
      // 模拟网络延迟和部分节点离线
      const isOnline = Math.random() > 0.1; // 90%的概率在线
      
      if (isOnline) {
        node.status = 'active';
        node.lastHeartbeat = Date.now();
      }
    }
  }

  /**
   * 检查节点健康状态
   */
  checkNodeHealth() {
    const now = Date.now();
    const timeoutThreshold = this.heartbeatInterval * 3;

    for (const [nodeId, node] of this.nodes) {
      if (nodeId !== this.nodeId) {
        if ((now - node.lastHeartbeat) > timeoutThreshold) {
          if (node.status === 'active') {
            console.log(`[PaxosManager] 节点 ${nodeId} 超时`);
            node.status = 'timeout';
          }
        }
      }
    }
  }

  /**
   * 提议一个值（Paxos算法核心）
   */
  async proposeValue(value) {
    if (!this.isInitialized) {
      throw new Error('PaxosManager 未初始化');
    }

    const proposalId = this.generateProposalId();
    
    try {
      console.log(`[PaxosManager] 开始提议 ${proposalId}:`, JSON.stringify(value, null, 2));
      
      // Phase 1: Prepare
      const prepareResult = await this.phase1Prepare(proposalId);
      if (!prepareResult.success) {
        throw new Error(`Prepare阶段失败: ${prepareResult.error}`);
      }

      // Phase 2: Accept
      const acceptResult = await this.phase2Accept(proposalId, value);
      if (!acceptResult.success) {
        throw new Error(`Accept阶段失败: ${acceptResult.error}`);
      }

      // 记录成功的提议
      this.proposalHistory.set(proposalId, {
        value,
        status: 'committed',
        timestamp: Date.now()
      });

      console.log(`[PaxosManager] 提议 ${proposalId} 成功提交`);
      
      return {
        success: true,
        proposalId,
        value,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`[PaxosManager] 提议 ${proposalId} 失败:`, error);
      
      this.proposalHistory.set(proposalId, {
        value,
        status: 'failed',
        error: error.message,
        timestamp: Date.now()
      });

      return {
        success: false,
        proposalId,
        error: error.message
      };
    }
  }

  /**
   * Phase 1: Prepare阶段
   */
  async phase1Prepare(proposalId) {
    return new Promise((resolve) => {
      console.log(`[PaxosManager] Phase 1 - Prepare ${proposalId}`);
      
      // 模拟网络延迟
      setTimeout(() => {
        const activeNodes = this.getActiveNodes();
        const majority = Math.floor(activeNodes.length / 2) + 1;
        
        // 简化实现：假设大多数节点都响应Promise
        const promiseCount = Math.min(activeNodes.length, majority + 1);
        
        if (promiseCount >= majority) {
          resolve({
            success: true,
            promiseCount,
            majority
          });
        } else {
          resolve({
            success: false,
            error: `未达到大多数节点响应 (${promiseCount}/${majority})`
          });
        }
      }, Math.random() * 100 + 50); // 50-150ms延迟
    });
  }

  /**
   * Phase 2: Accept阶段
   */
  async phase2Accept(proposalId, value) {
    return new Promise((resolve) => {
      console.log(`[PaxosManager] Phase 2 - Accept ${proposalId}`);
      
      // 模拟网络延迟
      setTimeout(() => {
        const activeNodes = this.getActiveNodes();
        const majority = Math.floor(activeNodes.length / 2) + 1;
        
        // 简化实现：假设大多数节点都接受
        const acceptCount = Math.min(activeNodes.length, majority + 1);
        
        if (acceptCount >= majority) {
          resolve({
            success: true,
            acceptCount,
            majority
          });
        } else {
          resolve({
            success: false,
            error: `未达到大多数节点接受 (${acceptCount}/${majority})`
          });
        }
      }, Math.random() * 100 + 50); // 50-150ms延迟
    });
  }

  /**
   * 生成提议ID
   */
  generateProposalId() {
    this.currentProposalId++;
    return `${this.nodeId}_${this.currentProposalId}_${Date.now()}`;
  }

  /**
   * 获取活跃节点
   */
  getActiveNodes() {
    return Array.from(this.nodes.values()).filter(node => 
      node.status === 'active' || node.isLocal
    );
  }

  /**
   * 获取连接的节点
   */
  getConnectedNodes() {
    return Array.from(this.nodes.keys());
  }

  /**
   * 同步所有节点
   */
  async synchronizeNodes() {
    try {
      console.log(`[PaxosManager] 开始同步节点...`);
      
      // 模拟同步过程
      const activeNodes = this.getActiveNodes();
      const syncResults = [];

      for (const node of activeNodes) {
        if (!node.isLocal) {
          // 模拟网络同步
          const syncSuccess = Math.random() > 0.2; // 80%成功率
          syncResults.push({
            nodeId: node.id,
            success: syncSuccess,
            timestamp: Date.now()
          });
        }
      }

      const successfulSyncs = syncResults.filter(r => r.success);
      
      return {
        success: true,
        totalNodes: activeNodes.length,
        syncedNodes: successfulSyncs.length,
        details: syncResults
      };

    } catch (error) {
      console.error(`[PaxosManager] 同步失败:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取状态信息
   */
  getStatus() {
    const activeNodes = this.getActiveNodes();
    
    return {
      nodeId: this.nodeId,
      isLeader: this.isLeader,
      isInitialized: this.isInitialized,
      totalNodes: this.nodes.size,
      activeNodes: activeNodes.length,
      proposalHistory: this.proposalHistory.size,
      nodes: Array.from(this.nodes.values()).map(node => ({
        id: node.id,
        status: node.status,
        isLocal: node.isLocal,
        lastHeartbeat: node.lastHeartbeat
      })),
      recentProposals: Array.from(this.proposalHistory.entries())
        .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map(([id, proposal]) => ({
          proposalId: id,
          status: proposal.status,
          timestamp: proposal.timestamp
        }))
    };
  }

  /**
   * 关闭管理器
   */
  async shutdown() {
    console.log(`[PaxosManager] 关闭节点 ${this.nodeId}`);
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    this.nodes.clear();
    this.proposalHistory.clear();
    this.isInitialized = false;
  }
}

module.exports = { PaxosManager };
