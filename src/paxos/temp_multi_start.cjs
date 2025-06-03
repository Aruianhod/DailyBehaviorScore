const { PaxosService } = require('./PaxosService.cjs'); 
 
async function startMultipleServices() { 
  const services = []; 
  for (let i = 1; i <= 3; i++) { 
    const service = new PaxosService({ 
      nodeId: `service_${i}`, 
      port: 3002, 
      portSearchRange: 10 
    }); 
    await service.start(); 
    services.push(service); 
    const info = service.getPortInfo(); 
    console.log(`服务${i}启动完成 - 端口: ${info.actual} ${info.switched ? '(已切换)' : '(默认)'}`); 
  } 
  process.on('SIGINT', async () => { 
    for (const service of services) { 
      await service.shutdown(); 
    } 
    process.exit(0); 
  }); 
} 
 
startMultipleServices().catch(console.error); 
