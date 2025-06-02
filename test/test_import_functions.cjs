const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

async function testImportFunctions() {
  console.log('=== 开始测试学生信息导入功能 ===\n');

  try {
    // 测试1: 手动导入功能
    console.log('1. 测试手动导入功能...');
    const testStudents = [
      { id: '2025000100', name: '测试学生1', grade: '2025', class: '2501' },
      { id: '2025000101', name: '测试学生2', grade: '2025', class: '2501' },
      { id: '2025000102', name: '测试学生3', grade: '2025', class: '2502' }
    ];

    const importResponse = await fetch(`${baseUrl}/api/admin/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: testStudents })
    });

    const importResult = await importResponse.json();
    if (importResponse.ok) {
      console.log('✅ 手动导入成功:', importResult.message);
      console.log(`   - 导入学生数: ${testStudents.length}名`);
    } else {
      console.log('❌ 手动导入失败:', importResult.message);
    }

    // 测试2: 验证导入的学生数据
    console.log('\n2. 验证导入的学生数据...');
    const studentsResponse = await fetch(`${baseUrl}/api/admin/students?grade=2025`);
    const studentsData = await studentsResponse.json();
    
    if (studentsResponse.ok) {
      const importedStudents = studentsData.students.filter(s => 
        testStudents.some(ts => ts.id === s.student_id)
      );
      console.log('✅ 数据验证成功');
      console.log(`   - 找到导入的学生: ${importedStudents.length}名`);
      console.log(`   - 学生信息: ${importedStudents.map(s => `${s.name}(${s.student_id})`).join(', ')}`);
    } else {
      console.log('❌ 数据验证失败:', studentsData.message);
    }

    // 测试3: 测试年级班级选项API
    console.log('\n3. 测试年级班级选项API...');
    const optionsResponse = await fetch(`${baseUrl}/api/admin/class-options`);
    const optionsData = await optionsResponse.json();
    
    if (optionsResponse.ok) {
      console.log('✅ 年级班级选项获取成功');
      console.log(`   - 可用年级: ${optionsData.grades.join(', ')}`);
      console.log(`   - 可用班级: ${optionsData.classes.slice(0, 5).join(', ')}${optionsData.classes.length > 5 ? '...' : ''}`);
    } else {
      console.log('❌ 年级班级选项获取失败:', optionsData.message);
    }

    // 测试4: 测试按年级筛选功能
    console.log('\n4. 测试按年级筛选功能...');
    const gradeFilterResponse = await fetch(`${baseUrl}/api/admin/students?grade=2025`);
    const gradeFilterData = await gradeFilterResponse.json();
    
    if (gradeFilterResponse.ok) {
      console.log('✅ 年级筛选功能正常');
      console.log(`   - 2025年级学生数: ${gradeFilterData.students.length}名`);
    } else {
      console.log('❌ 年级筛选功能失败:', gradeFilterData.message);
    }

    // 测试5: 清理测试数据
    console.log('\n5. 清理测试数据...');
    const deleteResponse = await fetch(`${baseUrl}/api/admin/students`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: testStudents.map(s => s.id) })
    });

    const deleteResult = await deleteResponse.json();
    if (deleteResponse.ok) {
      console.log('✅ 测试数据清理成功:', deleteResult.message);
    } else {
      console.log('⚠️  测试数据清理失败:', deleteResult.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }

  console.log('\n=== 导入功能测试完成 ===');
}

// 检查服务器连接
async function checkServer() {
  try {
    const response = await fetch(`${baseUrl}/api/admin/students`);
    return response.ok;
  } catch {
    return false;
  }
}

// 主执行函数
async function main() {
  console.log('📡 检查服务器连接...');
  const serverOk = await checkServer();
  
  if (!serverOk) {
    console.log('❌ 无法连接到服务器，请确保后端服务正在运行');
    return;
  }
  
  console.log('✅ 服务器连接正常\n');
  await testImportFunctions();
}

main();
