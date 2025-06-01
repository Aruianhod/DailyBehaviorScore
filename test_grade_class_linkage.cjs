const http = require('http');

// 测试年级-班级联动功能
async function testGradeClassLinkage() {
  console.log('🔗 测试年级-班级联动功能\n');

  // 请求函数
  function makeRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ error: data });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });
  }

  try {
    // 1. 获取所有年级和班级
    console.log('📊 获取所有年级和班级选项...');
    const allOptions = await makeRequest('/api/admin/class-options');
    console.log('年级数量:', allOptions.grades?.length || 0);
    console.log('班级数量:', allOptions.classes?.length || 0);
    console.log('前5个年级:', allOptions.grades?.slice(0, 5) || []);
    console.log('前10个班级:', allOptions.classes?.slice(0, 10) || []);

    // 2. 测试年级筛选
    if (allOptions.grades && allOptions.grades.length > 0) {
      const testGrades = allOptions.grades.slice(0, 3); // 测试前3个年级
      
      for (const grade of testGrades) {
        console.log(`\n🎓 测试年级 ${grade} 的班级筛选...`);
        const gradeOptions = await makeRequest(`/api/admin/class-options?grade=${grade}`);
        const filteredClasses = gradeOptions.classes || [];
        
        console.log(`年级 ${grade} 筛选出的班级数量:`, filteredClasses.length);
        console.log(`班级示例:`, filteredClasses.slice(0, 5));
        
        // 验证班级前两位是否与年级后两位对应
        const gradeLastTwo = grade.slice(-2);
        const validClasses = filteredClasses.filter(cls => cls.startsWith(gradeLastTwo));
        const validRate = filteredClasses.length > 0 ? (validClasses.length / filteredClasses.length * 100).toFixed(1) : '0';
        
        console.log(`年级 ${grade} (后两位: ${gradeLastTwo})`);
        console.log(`匹配规则的班级数: ${validClasses.length}/${filteredClasses.length} (${validRate}%)`);
        
        if (validClasses.length > 0) {
          console.log(`✅ 年级-班级联动规则正确`);
        } else if (filteredClasses.length === 0) {
          console.log(`⚠️  该年级暂无班级数据`);
        } else {
          console.log(`❌ 年级-班级联动规则不匹配`);
        }
      }
    }

    // 3. 测试特定年级的学生数据筛选
    console.log('\n👥 测试学生数据筛选...');
    const testGrade = allOptions.grades?.[0];
    if (testGrade) {
      const studentsResponse = await makeRequest(`/api/admin/students?grade=${testGrade}`);
      const students = studentsResponse.students || [];
      console.log(`年级 ${testGrade} 的学生数量:`, students.length);
      
      if (students.length > 0) {
        const sampleStudent = students[0];
        console.log('学生示例:', {
          student_id: sampleStudent.student_id,
          name: sampleStudent.name,
          grade: sampleStudent.grade,
          class: sampleStudent.class
        });
      }
    }

    console.log('\n🎯 年级-班级联动功能测试完成!');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
testGradeClassLinkage();
