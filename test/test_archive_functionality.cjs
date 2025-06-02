// 归档功能完整测试
const http = require('http');

const baseURL = 'localhost';
const port = 3000;

// HTTP请求工具函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseURL,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testArchiveFunctionality() {
  console.log('🧪 开始测试归档功能...\n');
  
  try {
    // 1. 测试获取归档统计
    console.log('1️⃣ 测试获取归档统计...');
    const statsResponse = await makeRequest('GET', '/api/admin/archive/stats');
    console.log('✅ 归档统计:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // 2. 测试执行归档操作
    console.log('2️⃣ 测试执行归档操作...');
    const archiveResponse = await makeRequest('POST', '/api/admin/archive/execute', {
      grades: ['2020'], // 只归档2020年级
      reason: '2020年级学生已毕业满4年，进行数据归档'
    });
    console.log('✅ 归档操作结果:', JSON.stringify(archiveResponse.data, null, 2));
    console.log('');

    // 3. 测试获取归档历史记录
    console.log('3️⃣ 测试获取归档历史记录...');
    const logsResponse = await makeRequest('GET', '/api/admin/archive/logs');
    console.log('✅ 归档历史记录:', JSON.stringify(logsResponse.data, null, 2));
    console.log('');

    // 4. 测试下载归档文件
    if (logsResponse.data.logs && logsResponse.data.logs.length > 0) {
      console.log('4️⃣ 测试下载归档文件...');
      const archiveId = logsResponse.data.logs[0].id;
      const downloadResponse = await makeRequest('GET', `/api/admin/archive/download/${archiveId}`);
      console.log('✅ 归档文件下载成功，数据量:', JSON.stringify({
        archiveInfo: downloadResponse.data.archiveInfo,
        statistics: downloadResponse.data.statistics,
        dataCount: downloadResponse.data.data ? downloadResponse.data.data.length : 0
      }, null, 2));
    } else {
      console.log('4️⃣ ⚠️ 没有归档记录，跳过下载测试');
    }

    // 5. 验证归档后的状态
    console.log('5️⃣ 验证归档后的统计状态...');
    const finalStatsResponse = await makeRequest('GET', '/api/admin/archive/stats');
    console.log('✅ 归档后统计:', JSON.stringify(finalStatsResponse.data, null, 2));

    console.log('\n🎉 归档功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await makeRequest('GET', '/api/admin/archive/stats');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('📡 检查服务器连接...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('❌ 服务器未运行或无法连接，请确保服务器已启动');
    console.log('请运行: node server.cjs');
    return;
  }
  
  console.log('✅ 服务器连接正常\n');
  await testArchiveFunctionality();
}

main();
