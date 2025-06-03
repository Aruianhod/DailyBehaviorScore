/**
 * 分布式一致性服务 - Paxos协议的业务层封装
 * 专门处理日常行为分管理系统的一致性检测需求
 */

const { PaxosManager } = require('./PaxosManager.cjs');

class DistributedConsistencyService {
  constructor(nodeId, options = {}) {
    this.nodeId = nodeId;
    this.paxosManager = new PaxosManager(nodeId, options);
    this.isInitialized = false;
    this.operationHistory = new Map(); // 操作历史记录
    this.conflictThreshold = options.conflictThreshold || 1000; // 冲突检测阈值（毫秒）
  }

  /**
   * 初始化分布式一致性服务
   */
  async initialize(nodeIds = []) {
    try {
      console.log(`[一致性服务] 初始化节点 ${this.nodeId}`);
      
      // 初始化Paxos管理器
      await this.paxosManager.initialize(nodeIds);
      
      this.isInitialized = true;
      console.log(`[一致性服务] 节点 ${this.nodeId} 初始化完成`);
      
      return {
        success: true,
        nodeId: this.nodeId,
        connectedNodes: this.paxosManager.getConnectedNodes()
      };
    } catch (error) {
      console.error(`[一致性服务] 初始化失败:`, error);
      throw error;
    }
  }

  /**
   * 检查分值修改操作的一致性
   */
  async checkScoreChangeConsistency(scoreChangeData) {
    const operationId = `score_change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`[一致性检查] 检查分值修改一致性: ${operationId}`);
      
      // 准备一致性检查数据
      const consistencyData = {
        operationType: 'score_change',
        operationId,
        studentId: scoreChangeData.studentId,
        oldScore: scoreChangeData.oldScore,
        newScore: scoreChangeData.newScore,
        changeReason: scoreChangeData.changeReason,
        operatorId: scoreChangeData.operatorId,
        timestamp: Date.now()
      };

      // 检查是否存在冲突
      const conflict = this.detectScoreChangeConflict(consistencyData);
      if (conflict) {
        return {
          success: false,
          conflict: true,
          conflictType: 'concurrent_score_change',
          conflictDetails: conflict,
          operationId
        };
      }

      // 通过Paxos协议达成一致
      const consensusResult = await this.paxosManager.proposeValue(consistencyData);
      
      if (consensusResult.success) {
        // 记录操作历史
        this.recordOperation(operationId, consistencyData);
        
        return {
          success: true,
          operationId,
          consensusAchieved: true,
          proposalId: consensusResult.proposalId
        };
      } else {
        return {
          success: false,
          operationId,
          reason: 'consensus_failed',
          details: consensusResult.error
        };
      }

    } catch (error) {
      console.error(`[一致性检查] 分值修改一致性检查失败:`, error);
      return {
        success: false,
        operationId,
        error: error.message
      };
    }
  }

  /**
   * 检查申请审核操作的一致性
   */
  async checkApplicationReviewConsistency(reviewData) {
    const operationId = `app_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`[一致性检查] 检查申请审核一致性: ${operationId}`);
      
      const consistencyData = {
        operationType: 'application_review',
        operationId,
        applicationId: reviewData.applicationId,
        reviewerId: reviewData.reviewerId,
        reviewResult: reviewData.reviewResult,
        reviewComments: reviewData.reviewComments,
        timestamp: Date.now()
      };

      // 检查重复审核冲突
      const conflict = this.detectReviewConflict(consistencyData);
      if (conflict) {
        return {
          success: false,
          conflict: true,
          conflictType: 'duplicate_review',
          conflictDetails: conflict,
          operationId
        };
      }

      // 通过Paxos协议达成一致
      const consensusResult = await this.paxosManager.proposeValue(consistencyData);
      
      if (consensusResult.success) {
        this.recordOperation(operationId, consistencyData);
        
        return {
          success: true,
          operationId,
          consensusAchieved: true,
          proposalId: consensusResult.proposalId
        };
      } else {
        return {
          success: false,
          operationId,
          reason: 'consensus_failed',
          details: consensusResult.error
        };
      }

    } catch (error) {
      console.error(`[一致性检查] 申请审核一致性检查失败:`, error);
      return {
        success: false,
        operationId,
        error: error.message
      };
    }
  }

  /**
   * 检查归档操作的一致性
   */
  async checkArchiveConsistency(archiveData) {
    const operationId = `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`[一致性检查] 检查归档操作一致性: ${operationId}`);
      
      const consistencyData = {
        operationType: 'archive_operation',
        operationId,
        archiveType: archiveData.archiveType,
        targetIds: archiveData.targetIds,
        operatorId: archiveData.operatorId,
        archiveReason: archiveData.archiveReason,
        timestamp: Date.now()
      };

      // 检查并发归档冲突
      const conflict = this.detectArchiveConflict(consistencyData);
      if (conflict) {
        return {
          success: false,
          conflict: true,
          conflictType: 'concurrent_archive',
          conflictDetails: conflict,
          operationId
        };
      }

      // 通过Paxos协议达成一致
      const consensusResult = await this.paxosManager.proposeValue(consistencyData);
      
      if (consensusResult.success) {
        this.recordOperation(operationId, consistencyData);
        
        return {
          success: true,
          operationId,
          consensusAchieved: true,
          proposalId: consensusResult.proposalId
        };
      } else {
        return {
          success: false,
          operationId,
          reason: 'consensus_failed',
          details: consensusResult.error
        };
      }

    } catch (error) {
      console.error(`[一致性检查] 归档操作一致性检查失败:`, error);
      return {
        success: false,
        operationId,
        error: error.message
      };
    }
  }

  /**
   * 检测分值修改冲突
   */
  detectScoreChangeConflict(consistencyData) {
    const recentOperations = this.getRecentOperations('score_change', this.conflictThreshold);
    
    for (const [opId, operation] of recentOperations) {
      if (operation.studentId === consistencyData.studentId &&
          Math.abs(operation.timestamp - consistencyData.timestamp) < this.conflictThreshold) {
        return {
          conflictingOperationId: opId,
          conflictingOperator: operation.operatorId,
          timeDifference: Math.abs(operation.timestamp - consistencyData.timestamp),
          message: `学生 ${consistencyData.studentId} 的分值正在被 ${operation.operatorId} 修改`
        };
      }
    }
    
    return null;
  }

  /**
   * 检测审核冲突
   */
  detectReviewConflict(consistencyData) {
    const recentOperations = this.getRecentOperations('application_review', this.conflictThreshold);
    
    for (const [opId, operation] of recentOperations) {
      if (operation.applicationId === consistencyData.applicationId) {
        return {
          conflictingOperationId: opId,
          conflictingReviewer: operation.reviewerId,
          message: `申请 ${consistencyData.applicationId} 已被 ${operation.reviewerId} 审核`
        };
      }
    }
    
    return null;
  }

  /**
   * 检测归档冲突
   */
  detectArchiveConflict(consistencyData) {
    const recentOperations = this.getRecentOperations('archive_operation', this.conflictThreshold);
    
    for (const [opId, operation] of recentOperations) {
      // 检查是否有重叠的目标ID
      const overlappingIds = consistencyData.targetIds.filter(id => 
        operation.targetIds && operation.targetIds.includes(id)
      );
      
      if (overlappingIds.length > 0 &&
          Math.abs(operation.timestamp - consistencyData.timestamp) < this.conflictThreshold) {
        return {
          conflictingOperationId: opId,
          conflictingOperator: operation.operatorId,
          overlappingTargets: overlappingIds,
          message: `目标对象正在被 ${operation.operatorId} 归档`
        };
      }
    }
    
    return null;
  }

  /**
   * 获取最近的操作记录
   */
  getRecentOperations(operationType, timeWindow) {
    const now = Date.now();
    const recentOps = new Map();
    
    for (const [opId, operation] of this.operationHistory) {
      if (operation.operationType === operationType &&
          (now - operation.timestamp) <= timeWindow) {
        recentOps.set(opId, operation);
      }
    }
    
    return recentOps;
  }

  /**
   * 记录操作历史
   */
  recordOperation(operationId, operationData) {
    this.operationHistory.set(operationId, operationData);
    
    // 清理过期的操作记录（保留24小时）
    const expirationTime = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [opId, operation] of this.operationHistory) {
      if ((now - operation.timestamp) > expirationTime) {
        this.operationHistory.delete(opId);
      }
    }
  }

  /**
   * 强制同步所有节点
   */
  async forceSync() {
    try {
      console.log(`[一致性服务] 开始强制同步...`);
      
      const syncResult = await this.paxosManager.synchronizeNodes();
      
      return {
        success: true,
        syncedNodes: syncResult.syncedNodes,
        syncTimestamp: Date.now()
      };
    } catch (error) {
      console.error(`[一致性服务] 强制同步失败:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      nodeId: this.nodeId,
      isInitialized: this.isInitialized,
      operationHistorySize: this.operationHistory.size,
      paxosStatus: this.paxosManager.getStatus(),
      recentOperations: Array.from(this.operationHistory.entries())
        .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        .slice(0, 10)
        .map(([id, op]) => ({
          operationId: id,
          operationType: op.operationType,
          timestamp: op.timestamp,
          operator: op.operatorId || op.reviewerId
        }))
    };
  }

  /**
   * 清理资源
   */
  async shutdown() {
    console.log(`[一致性服务] 关闭节点 ${this.nodeId}`);
    
    if (this.paxosManager) {
      await this.paxosManager.shutdown();
    }
    
    this.operationHistory.clear();
    this.isInitialized = false;
  }
}

module.exports = { DistributedConsistencyService };
