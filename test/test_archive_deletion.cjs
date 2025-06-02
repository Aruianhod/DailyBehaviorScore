// 测试归档是否真正删除数据
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

async function testArchiveDeletion() {
  try {
    console.log('🧪 测试归档是否真正删除数据...\n');
    
    // 1. 获取归档前的统计信息
    console.log('1️⃣ 获取归档前统计信息...');
    const statsBefore = await makeRequest('GET', '/api/admin/archive/stats');
    console.log('✅ 归档前统计:', JSON.stringify(statsBefore.data, null, 2));
    
    // 2. 执行归档操作
    console.log('\n2️⃣ 执行2020年级归档操作...');
    const archiveResult = await makeRequest('POST', '/api/admin/archive/execute', {
      grades: ['2020'],
      reason: '测试归档删除功能 - 验证数据是否真正被删除'
    });
    
    console.log('✅ 归档操作结果:', JSON.stringify(archiveResult.data, null, 2));
    
    // 3. 获取归档后的统计信息
    console.log('\n3️⃣ 获取归档后统计信息...');
    const statsAfter = await makeRequest('GET', '/api/admin/archive/stats');
    console.log('✅ 归档后统计:', JSON.stringify(statsAfter.data, null, 2));
    
    // 4. 尝试获取已归档的学生数据
    console.log('\n4️⃣ 验证数据是否已被删除...');
    const studentsResult = await makeRequest('GET', '/api/admin/students?grade=2020');
    console.log('✅ 2020年级学生查询结果:', JSON.stringify(studentsResult.data, null, 2));
    
    // 5. 分析结果
    console.log('\n📊 分析结果:');
    const studentsBefore = statsBefore.data.archivableStudents;
    const studentsAfter = statsAfter.data.archivableStudents;
    const remainingStudents = studentsResult.data.students ? studentsResult.data.students.length : 0;
    
    console.log(`   - 归档前可归档学生数: ${studentsBefore}`);
    console.log(`   - 归档后可归档学生数: ${studentsAfter}`);
    console.log(`   - 查询到的2020年级学生数: ${remainingStudents}`);
    
    if (remainingStudents === 0 && archiveResult.data.stats.studentCount > 0) {
      console.log('✅ 数据删除验证成功：归档操作真正删除了数据！');
    } else if (remainingStudents > 0) {
      console.log('⚠️  数据仍然存在：归档可能只是标记为已归档状态');
    } else {
      console.log('ℹ️  没有找到可归档的数据进行测试');
    }
    
    console.log('\n🎉 归档删除测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testArchiveDeletion();
