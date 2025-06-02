// 测试按需加载功能的API
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  console.log('🧪 测试按需加载功能...\n');

  try {
    // 1. 测试获取年级班级选项
    console.log('1️⃣ 测试获取年级班级选项...');
    const optionsData = await makeRequest('http://localhost:3000/api/admin/class-options');
    console.log('✅ 年级班级选项:', optionsData);

    // 2. 测试获取所有学生（无筛选）
    console.log('\n2️⃣ 测试获取所有学生（无筛选）...');
    const allStudentsData = await makeRequest('http://localhost:3000/api/admin/students');
    console.log(`✅ 获取到${allStudentsData.students.length}个学生`);

    // 3. 测试按年级筛选
    if (optionsData.grades && optionsData.grades.length > 0) {
      const testGrade = optionsData.grades[0];
      console.log(`\n3️⃣ 测试按年级筛选（${testGrade}级）...`);
      const gradeFilterData = await makeRequest(`http://localhost:3000/api/admin/students?grade=${encodeURIComponent(testGrade)}`);
      console.log(`✅ ${testGrade}级学生数量:`, gradeFilterData.students.length);
    }

    // 4. 测试按班级筛选
    if (optionsData.classes && optionsData.classes.length > 0) {
      const testClass = optionsData.classes[0];
      console.log(`\n4️⃣ 测试按班级筛选（${testClass}）...`);
      const classFilterData = await makeRequest(`http://localhost:3000/api/admin/students?class=${encodeURIComponent(testClass)}`);
      console.log(`✅ ${testClass}学生数量:`, classFilterData.students.length);
    }

    // 5. 测试年级+班级双重筛选
    if (optionsData.grades && optionsData.grades.length > 0 && optionsData.classes && optionsData.classes.length > 0) {
      const testGrade = optionsData.grades[0];
      const testClass = optionsData.classes[0];
      console.log(`\n5️⃣ 测试年级+班级双重筛选（${testGrade}级${testClass}）...`);
      const doubleFilterData = await makeRequest(`http://localhost:3000/api/admin/students?grade=${encodeURIComponent(testGrade)}&class=${encodeURIComponent(testClass)}`);
      console.log(`✅ ${testGrade}级${testClass}学生数量:`, doubleFilterData.students.length);
    }

    console.log('\n🎉 所有API测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testAPI();
