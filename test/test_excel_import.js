const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

async function testExcelImport() {
  console.log('Testing Excel import functionality...');
  
  try {
    // 创建表单数据
    const form = new FormData();
    const fileBuffer = fs.readFileSync('test_students.csv');
    form.append('file', fileBuffer, {
      filename: 'test_students.csv',
      contentType: 'text/csv'
    });
    
    const response = await fetch('http://localhost:3000/api/admin/import-excel', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    console.log('Excel import result:', result);
    
  } catch (error) {
    console.error('Excel test failed:', error.message);
  }
}

testExcelImport();
