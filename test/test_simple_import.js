const fetch = require('node-fetch');

async function testImport() {
  console.log('Testing import functionality...');
  
  try {
    // Test server connection
    const healthCheck = await fetch('http://localhost:3000/api/students');
    console.log('Server status:', healthCheck.status);
    
    // Test manual import
    const testData = {
      students: [
        { id: '2025000001', name: '测试学生1', grade: '2025', class: '01' },
        { id: '2025000002', name: '测试学生2', grade: '2025', class: '02' }
      ]
    };
    
    const importRes = await fetch('http://localhost:3000/api/admin/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await importRes.json();
    console.log('Import result:', result);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testImport();
