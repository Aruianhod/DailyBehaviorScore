import React, { useState } from 'react';

const SimpleArchiveTest: React.FC = () => {
  const [page, setPage] = useState<'menu' | 'archive'>('menu');

  const handleArchiveClick = () => {
    console.log('归档按钮被点击');
    setPage('archive');
  };

  const handleBackClick = () => {
    console.log('返回按钮被点击');
    setPage('menu');
  };

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      {page === 'menu' && (
        <div>
          <h2>简单归档测试</h2>
          <p>当前页面: {page}</p>
          
          <div
            onClick={handleArchiveClick}
            style={{
              padding: 20,
              border: '2px solid #7b1fa2',
              borderRadius: 8,
              cursor: 'pointer',
              background: '#f3e5f5',
              margin: '20px 0'
            }}
          >
            <h3>📁 归档功能</h3>
            <p>点击测试归档功能导航</p>
          </div>
          
          <div style={{ marginTop: 20, padding: 15, background: '#f0f0f0', borderRadius: 6 }}>
            <h4>调试信息:</h4>
            <p>当前状态: {page}</p>
            <p>React组件已渲染</p>
          </div>
        </div>
      )}
      
      {page === 'archive' && (
        <div>
          <button 
            onClick={handleBackClick}
            style={{
              padding: '10px 20px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: 6,
              cursor: 'pointer',
              marginBottom: 20
            }}
          >
            ← 返回主页
          </button>
          
          <h2>归档管理页面</h2>
          <p>当前页面: {page}</p>
          
          <div style={{ padding: 20, background: '#e8f5e8', borderRadius: 6 }}>
            <h3>✓ 归档功能导航成功！</h3>
            <p>如果你看到这个页面，说明归档功能的导航是正常工作的。</p>
          </div>
          
          <div style={{ marginTop: 20, padding: 15, background: '#f0f0f0', borderRadius: 6 }}>
            <h4>调试信息:</h4>
            <p>当前状态: {page}</p>
            <p>归档页面已成功加载</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleArchiveTest;
