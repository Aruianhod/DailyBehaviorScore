// 调试归档API响应数据
async function debugArchiveAPI() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🔍 开始调试归档API...\n');
    
    try {
        // 1. 测试归档统计API
        console.log('📊 测试归档统计API');
        const statsResponse = await fetch(`${baseURL}/api/admin/archive/stats`);
        const statsData = await statsResponse.json();
        
        console.log('状态码:', statsResponse.status);
        console.log('响应数据:', JSON.stringify(statsData, null, 2));
        
        // 检查undefined值
        Object.keys(statsData).forEach(key => {
            if (statsData[key] === undefined) {
                console.log(`❌ 发现undefined字段: ${key}`);
            } else if (statsData[key] === null) {
                console.log(`⚠️ 发现null字段: ${key}`);
            }
        });
        
        console.log('\n');
        
        // 2. 测试归档日志API
        console.log('📋 测试归档日志API');
        const logsResponse = await fetch(`${baseURL}/api/admin/archive/logs`);
        const logsData = await logsResponse.json();
        
        console.log('状态码:', logsResponse.status);
        console.log('响应数据:', JSON.stringify(logsData, null, 2));
        
        // 检查日志数据中的undefined值
        if (logsData.logs && Array.isArray(logsData.logs)) {
            logsData.logs.forEach((log, index) => {
                Object.keys(log).forEach(key => {
                    if (log[key] === undefined) {
                        console.log(`❌ 日志${index}发现undefined字段: ${key}`);
                    } else if (log[key] === null) {
                        console.log(`⚠️ 日志${index}发现null字段: ${key}`);
                    }
                });
            });
        }
        
    } catch (error) {
        console.error('❌ API调试失败:', error);
    }
}

// 运行调试
debugArchiveAPI();
