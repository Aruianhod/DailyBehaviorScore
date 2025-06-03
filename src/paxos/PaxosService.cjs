/**
 * Paxos一致性检测服务 - 独立服务入口
 * 可以作为独立进程运行，也可以作为模块被主服务器调用
 */

const express = require('express');
const cors = require('cors');
const { DistributedConsistencyService } = require('./DistributedConsistencyService.cjs');
const { findAvailablePort, getPortStatus } = require('./utils/portUtils.cjs');

class PaxosService {
  constructor(options = {}) {
    this.app = express();
    this.defaultPort = options.port || 3002;
    this.actualPort = null; // 实际使用的端口
    this.nodeId = options.nodeId || `paxos_node_${Date.now()}`;
    this.consistencyService = new DistributedConsistencyService(this.nodeId, options);
    this.server = null;
    this.portSearchRange = options.portSearchRange || 10; // 端口搜索范围
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    
    // 请求日志中间件
    this.app.use((req, res, next) => {
      console.log(`[Paxos] ${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // 错误处理中间件
    this.app.use((error, req, res, next) => {
      console.error('❌ 服务错误:', error);
      res.status(500).json({
        success: false,
        message: '内部服务器错误',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }

  setupRoutes() {    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        nodeId: this.nodeId,
        timestamp: new Date().toISOString(),
        initialized: this.consistencyService.isInitialized,
        version: '1.0.0',
        port: {
          default: this.defaultPort,
          actual: this.actualPort
        }
      });
    });

    // 初始化Paxos网络
    this.app.post('/initialize', async (req, res) => {
      try {
        const { nodeIds } = req.body;
        const result = await this.consistencyService.initialize(nodeIds || []);
        res.json({
          success: true,
          message: 'Paxos网络初始化成功',
          data: result
        });
      } catch (error) {
        console.error('初始化失败:', error);
        res.status(500).json({
          success: false,
          message: '初始化失败',
          error: error.message
        });
      }
    });

    // 分值修改一致性检查
    this.app.post('/consistency/score-change', async (req, res) => {
      try {
        const result = await this.consistencyService.checkScoreChangeConsistency(req.body);
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        console.error('分值修改一致性检查失败:', error);
        res.status(500).json({
          success: false,
          message: '一致性检查失败',
          error: error.message
        });
      }
    });

    // 申请审核一致性检查
    this.app.post('/consistency/application-review', async (req, res) => {
      try {
        const result = await this.consistencyService.checkApplicationReviewConsistency(req.body);
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        console.error('申请审核一致性检查失败:', error);
        res.status(500).json({
          success: false,
          message: '一致性检查失败',
          error: error.message
        });
      }
    });

    // 归档操作一致性检查
    this.app.post('/consistency/archive', async (req, res) => {
      try {
        const result = await this.consistencyService.checkArchiveConsistency(req.body);
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        console.error('归档一致性检查失败:', error);
        res.status(500).json({
          success: false,
          message: '一致性检查失败',
          error: error.message
        });
      }
    });

    // 服务状态端点
    this.app.get('/status', (req, res) => {
      try {
        const status = {
          status: 'healthy',
          nodeId: this.nodeId,
          port: this.actualPort || this.defaultPort,
          isLeader: this.manager?.isLeader() || false,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage()
        };
        
        res.json({
          success: true,
          data: status
        });
      } catch (error) {
        console.error('获取状态失败:', error);
        res.status(500).json({
          success: false,
          message: '获取状态失败',
          error: error.message
        });
      }
    });

    // 强制同步
    this.app.post('/sync', async (req, res) => {
      try {
        const result = await this.consistencyService.forceSync();
        res.json({
          success: true,
          message: '同步完成',
          data: result
        });
      } catch (error) {
        console.error('强制同步失败:', error);
        res.status(500).json({
          success: false,
          message: '同步失败',
          error: error.message
        });
      }
    });    // API文档
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Paxos一致性检测服务',
        version: '1.0.0',
        nodeId: this.nodeId,
        endpoints: {
          'GET /health': '健康检查',
          'POST /initialize': '初始化Paxos网络',
          'POST /consistency/score-change': '分值修改一致性检查',
          'POST /consistency/application-review': '申请审核一致性检查',
          'POST /consistency/archive': '归档操作一致性检查',
          'GET /status': '获取服务状态',
          'POST /sync': '强制同步节点'
        }
      });
    });
  }

  /**
   * 启动Paxos服务（带自动端口切换功能）
   */
  async start() {
    try {
      // 自动初始化一致性服务
      await this.consistencyService.initialize();
      
      // 尝试启动服务，如果端口被占用则自动切换
      return await this.startWithPortRetry();
    } catch (error) {
      console.error('❌ 启动Paxos服务失败:', error);
      throw error;
    }
  }

  /**
   * 带端口重试的启动方法
   */
  async startWithPortRetry() {
    for (let i = 0; i < this.portSearchRange; i++) {
      const portToTry = this.defaultPort + i;
      
      try {
        if (i > 0) {
          console.log(`🔄 尝试端口: ${portToTry}`);
        } else {
          console.log(`🔍 尝试默认端口: ${portToTry}`);
        }
        
        await this.startOnPort(portToTry);
        this.actualPort = portToTry;
        
        if (portToTry !== this.defaultPort) {
          console.log(`⚡ 端口自动切换: ${this.defaultPort} -> ${this.actualPort}`);
        }
        
        console.log(`✅ Paxos一致性检测服务启动成功`);
        console.log(`📡 节点ID: ${this.nodeId}`);
        console.log(`🌐 服务地址: http://localhost:${this.actualPort}`);
        console.log(`📊 健康检查: http://localhost:${this.actualPort}/health`);
        console.log(`📖 API文档: http://localhost:${this.actualPort}/`);
        console.log('🔥 服务已就绪，等待请求...\n');
        return;
          } catch (error) {
        if (error.code === 'EADDRINUSE' || error.message.includes('端口绑定') || error.message.includes('无法获取服务器地址')) {
          console.log(`⚠️  端口 ${portToTry} 已被占用，尝试下一个端口...`);
          if (i === this.portSearchRange - 1) {
            throw new Error(`❌ 在端口范围 ${this.defaultPort}-${this.defaultPort + this.portSearchRange - 1} 内未找到可用端口`);
          }
          continue;
        } else {
          throw error;
        }
      }
    }
  }  /**
   * 在指定端口启动服务
   */  async startOnPort(port) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      
      const server = this.app.listen(port, '0.0.0.0', () => {
        if (resolved) return;
        
        try {
          // 验证实际绑定的端口
          const address = server.address();
          if (!address) {
            resolved = true;
            const error = new Error(`无法获取服务器地址信息`);
            error.code = 'EADDRINUSE';
            server.close();
            reject(error);
            return;
          }
          
          const actualPort = address.port;
          if (actualPort !== port) {
            resolved = true;
            const error = new Error(`端口绑定异常：请求端口 ${port}，实际绑定端口 ${actualPort}`);
            error.code = 'EADDRINUSE';
            server.close();
            reject(error);
            return;
          }
          
          resolved = true;
          this.server = server;
          console.log(`🔗 成功绑定到端口: ${actualPort}`);
          resolve();
        } catch (err) {
          if (!resolved) {
            resolved = true;
            const error = new Error(`端口绑定失败: ${err.message}`);
            error.code = 'EADDRINUSE';
            server.close();
            reject(error);
          }
        }
      });

      server.on('error', (error) => {
        if (resolved) return;
        resolved = true;
        console.log(`❌ 端口 ${port} 启动失败: ${error.code || error.message}`);
        reject(error);
      });
      
      // 添加超时机制，防止启动时间过长
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          server.close();
          const error = new Error(`启动超时：端口 ${port} 启动时间过长`);
          error.code = 'ETIMEOUT';
          reject(error);
        }
      }, 2000);
    });
  }

  /**
   * 关闭Paxos服务
   */
  async shutdown() {
    console.log('🛑 正在关闭Paxos服务...');
    
    try {
      // 关闭一致性服务
      if (this.consistencyService) {
        await this.consistencyService.shutdown();
      }

      // 关闭HTTP服务器
      if (this.server) {
        return new Promise((resolve) => {
          this.server.close(() => {
            console.log('✅ Paxos服务已成功关闭');
            resolve();
          });
        });
      }
    } catch (error) {
      console.error('❌ 关闭服务时出错:', error);
      throw error;
    }
  }
  /**
   * 获取一致性服务实例（用于主服务器集成）
   */
  getConsistencyService() {
    return this.consistencyService;
  }

  /**
   * 获取实际使用的端口号
   */
  getActualPort() {
    return this.actualPort;
  }

  /**
   * 获取默认端口号
   */
  getDefaultPort() {
    return this.defaultPort;
  }

  /**
   * 获取端口信息
   */
  getPortInfo() {
    return {
      default: this.defaultPort,
      actual: this.actualPort,
      switched: this.actualPort !== this.defaultPort
    };
  }

  /**
   * 检查服务是否正在运行
   */
  isRunning() {
    return this.server && this.server.listening;
  }

  /**
   * 获取Express应用实例（用于路由集成）
   */
  getApp() {
    return this.app;
  }
}

// 如果直接运行此文件，启动独立服务
if (require.main === module) {
  const service = new PaxosService({
    port: process.env.PAXOS_PORT || 3002,
    nodeId: process.env.NODE_ID || 'main_paxos_node'
  });
  
  // 启动服务
  service.start().catch(error => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });

  // 优雅关闭处理
  process.on('SIGTERM', async () => {
    console.log('\n📡 收到SIGTERM信号，准备关闭服务...');
    await service.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('\n📡 收到SIGINT信号，准备关闭服务...');
    await service.shutdown();
    process.exit(0);
  });

  // 未处理错误捕获
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    console.error('Promise:', promise);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    process.exit(1);
  });
}

module.exports = { PaxosService };
