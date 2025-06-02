const http = require('http');

// 测试下载API
async function testDownload() {
  return new Promise((resolve, reject) => {
    console.log('🔗 测试下载API...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/archive/download/1',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000 // 5秒超时
    };

    const req = http.request(options, (res) => {
      console.log(`✅ 响应状态: ${res.statusCode}`);
      console.log(`📋 响应头:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        console.log(`📦 接收数据块: ${chunk.length} bytes`);
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ 下载成功:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (e) {
          console.log('📄 原始响应:', data);
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求错误:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('⏰ 请求超时');
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

async function main() {
  try {
    await testDownload();
    console.log('🎉 测试完成');
  } catch (error) {
    console.error('💥 测试失败:', error.message);
  }
}

main();
