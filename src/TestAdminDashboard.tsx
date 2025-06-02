import React, { useState } from 'react';

// 简化的归档管理组件用于测试
const SimpleArchiveTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
      <h2 style={{ color: '#7b1fa2' }}>🗂️ 归档管理测试页面</h2>
      <p>如果您能看到这个页面，说明归档功能的导航是正常的。</p>
      <div style={{ margin: '20px 0', padding: '15px', background: '#e8f5e8', borderRadius: '5px' }}>
        ✅ 归档组件已成功加载
      </div>
    </div>
  );
};

// 简化的管理员仪表板用于测试
const TestAdminDashboard: React.FC = () => {
  const [page, setPage] = useState<'menu' | 'archive'>('menu');

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {page === 'menu' && (
        <>
          <h2 style={{ marginBottom: '30px', color: '#333' }}>归档功能测试</h2>
          
          <div
            onClick={() => {
              console.log('点击归档功能测试按钮');
              setPage('archive');
            }}
            style={{
              padding: '20px',
              background: '#f3e5f5',
              border: '2px solid #7b1fa2',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e1bee7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3e5f5';
            }}
          >
            <h3 style={{ margin: 0, color: '#7b1fa2' }}>🗂️ 测试归档功能</h3>
            <p style={{ margin: '10px 0 0 0', color: '#666' }}>点击此处测试归档功能导航</p>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
            📝 <strong>测试说明：</strong>点击上方卡片应该能够切换到归档页面
          </div>
        </>
      )}
      
      {page === 'archive' && (
        <>
          <button 
            onClick={() => setPage('menu')}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← 返回测试主页
          </button>
          <SimpleArchiveTest />
        </>
      )}
    </div>
  );
};

export default TestAdminDashboard;
