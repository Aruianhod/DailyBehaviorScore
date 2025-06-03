/**
 * 端口工具函数 - 用于端口检测和自动切换
 */

const net = require('net');

/**
 * 检查端口是否可用
 * @param {number} port - 要检查的端口号
 * @param {string} host - 主机地址，默认为 'localhost'
 * @returns {Promise<boolean>} - 端口是否可用
 */
function checkPortAvailable(port, host = 'localhost') {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    // 设置超时
    const timeout = setTimeout(() => {
      server.close();
      resolve(false);
    }, 1000);
    
    server.listen(port, host, () => {
      clearTimeout(timeout);
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', (err) => {
      clearTimeout(timeout);
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * 寻找可用的端口
 * @param {number} startPort - 起始端口号
 * @param {number} maxAttempts - 最大尝试次数，默认为10
 * @param {string} host - 主机地址，默认为 'localhost'
 * @returns {Promise<number>} - 可用的端口号
 */
async function findAvailablePort(startPort, maxAttempts = 10, host = 'localhost') {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isAvailable = await checkPortAvailable(port, host);
    
    if (isAvailable) {
      console.log(`✅ 找到可用端口: ${port}`);
      return port;
    } else {
      console.log(`⚠️  端口 ${port} 已被占用，尝试下一个端口...`);
    }
  }
  
  throw new Error(`❌ 在 ${startPort}-${startPort + maxAttempts - 1} 范围内未找到可用端口`);
}

/**
 * 获取端口使用情况信息
 * @param {number} port - 端口号
 * @param {string} host - 主机地址
 * @returns {Promise<object>} - 端口状态信息
 */
async function getPortStatus(port, host = 'localhost') {
  const isAvailable = await checkPortAvailable(port, host);
  return {
    port,
    host,
    available: isAvailable,
    status: isAvailable ? 'free' : 'occupied',
    timestamp: new Date().toISOString()
  };
}

/**
 * 批量检查多个端口的状态
 * @param {number[]} ports - 端口数组
 * @param {string} host - 主机地址
 * @returns {Promise<object[]>} - 端口状态数组
 */
async function checkMultiplePorts(ports, host = 'localhost') {
  const results = [];
  
  for (const port of ports) {
    const status = await getPortStatus(port, host);
    results.push(status);
  }
  
  return results;
}

module.exports = {
  checkPortAvailable,
  findAvailablePort,
  getPortStatus,
  checkMultiplePorts
};
