/**
 * 简单的单节点Paxos服务启动器 - 用于测试主服务器集成
 */

const { PaxosService } = require('./PaxosService.cjs');

async function startSimplePaxosService() {
  console.log('🚀 启动简单Paxos服务...');
  
  try {
    const service = new PaxosService({
      nodeId: 'main_service',
      port: 3002, // 使用默认端口
      portSearchRange: 10
    });
    
    await service.start();
    
    console.log('✅ Paxos服务启动成功');
    console.log(`📡 节点ID: main_service`);
    console.log(`🌐 服务地址: http://localhost:${service.getActualPort()}`);
    console.log('🔥 等待主服务器连接...');
    
    // 保持服务运行
    process.on('SIGINT', async () => {
      console.log('\n🛑 正在关闭服务...');
      try {
        await service.shutdown();
        console.log('✅ 服务已安全关闭');
        process.exit(0);
      } catch (error) {
        console.error('❌ 关闭服务时出错:', error);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
}

startSimplePaxosService().catch(console.error);
