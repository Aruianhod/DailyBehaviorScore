/**
 * 快速端口切换测试
 */

const { PaxosService } = require('./PaxosService.cjs');

async function testPortSwitching() {
  console.log('🧪 端口切换测试');
  console.log('=' + '='.repeat(30));
  
  const service = new PaxosService({
    nodeId: 'test_port_switch',
    port: 3002, // 这个端口已经被占用
    portSearchRange: 5
  });
  
  await service.start();
  
  const info = service.getPortInfo();
  console.log('\n🔄 端口切换结果:');
  console.log('📌 默认端口:', info.default);
  console.log('📍 实际端口:', info.actual);
  console.log('🔄 是否切换:', info.switched ? '✅ 是 (端口冲突，已自动切换)' : '❌ 否');
  
  if (info.switched) {
    console.log('🎉 端口自动切换功能正常工作！');
  }
  
  // 立即关闭以释放端口
  setTimeout(async () => {
    await service.shutdown();
    process.exit(0);
  }, 1000);
}

testPortSwitching().catch(console.error);
