import React, { useState } from 'react';
import StudentTable from './StudentTable';
import AdminReview from './AdminReview';
import TeacherManagement from './TeacherManagement';

const AdminDashboard: React.FC = () => {
  const [page, setPage] = useState<'menu' | 'students' | 'review' | 'teachers' | 'archive'>('menu');

  return (
    <div style={{ maxWidth: 2000, margin: '40px auto', background: '#fff', borderRadius: 6, boxShadow: '0 2px 8px #e5e7eb', padding: '32px 40px 40px 40px', minHeight: 320 }}>
      {page === 'menu' && (
        <>
          <h2 style={{ textAlign: 'left', fontSize: 28, fontWeight: 600, marginBottom: 36, color: '#333' }}>管理员功能</h2>
          
          {/* 功能卡片网格 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 24, 
            maxWidth: 800, 
            margin: '0 auto' 
          }}>
            {/* 查看学生信息 */}
            <div
              onClick={() => setPage('students')}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#1976d2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <div style={{ 
                width: 48, 
                height: 48, 
                background: '#e3f2fd', 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 16 
              }}>
                <span style={{ fontSize: 24, color: '#1976d2' }}>👥</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1976d2', marginBottom: 8 }}>
                查看学生信息
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                查看、导入和管理学生基本信息
              </p>
            </div>

            {/* 审查功能 */}
            <div
              onClick={() => setPage('review')}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#f57c00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <div style={{ 
                width: 48, 
                height: 48, 
                background: '#fff3e0', 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 16 
              }}>
                <span style={{ fontSize: 24, color: '#f57c00' }}>📋</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#f57c00', marginBottom: 8 }}>
                审查功能
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                审查老师提交的分值修改申请
              </p>
            </div>

            {/* 老师账号管理 */}
            <div
              onClick={() => setPage('teachers')}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#388e3c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <div style={{ 
                width: 48, 
                height: 48, 
                background: '#e8f5e8', 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 16 
              }}>
                <span style={{ fontSize: 24, color: '#388e3c' }}>👨‍🏫</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#388e3c', marginBottom: 8 }}>
                老师账号管理
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                管理老师账号，创建和修改权限
              </p>
            </div>

            {/* 归档功能 */}
            <div
              onClick={() => setPage('archive')}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#7b1fa2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <div style={{ 
                width: 48, 
                height: 48, 
                background: '#f3e5f5', 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 16 
              }}>
                <span style={{ fontSize: 24, color: '#7b1fa2' }}>📁</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#7b1fa2', marginBottom: 8 }}>
                归档功能
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                查看历史数据和归档记录
              </p>
            </div>
          </div>
        </>
      )}
      {page === 'students' && (
        <>
          <button 
            style={{ 
              marginBottom: 16,
              background: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #e0e0e0', 
              borderRadius: 8, 
              padding: '12px 24px', 
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setPage('menu')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            <span>←</span> 返回主页
          </button>
          <StudentTable />
        </>
      )}
      {page === 'review' && (
        <>
          <button 
            style={{ 
              marginBottom: 16,
              background: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #e0e0e0', 
              borderRadius: 8, 
              padding: '12px 24px', 
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setPage('menu')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            <span>←</span> 返回主页
          </button>
          <AdminReview />
        </>
      )}
      {page === 'teachers' && (
        <>
          <button 
            style={{ 
              marginBottom: 16,
              background: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #e0e0e0', 
              borderRadius: 8, 
              padding: '12px 24px', 
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setPage('menu')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            <span>←</span> 返回主页
          </button>
          <TeacherManagement />
        </>
      )}
      {page === 'archive' && (
        <>
          <button 
            style={{ 
              marginBottom: 16,
              background: '#f5f5f5', 
              color: '#333', 
              border: '1px solid #e0e0e0', 
              borderRadius: 8, 
              padding: '12px 24px', 
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setPage('menu')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            <span>←</span> 返回主页
          </button>
          {/* 归档功能组件 - 暂时显示占位内容 */}
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
            <h3 style={{ marginBottom: 16 }}>归档功能</h3>
            <p>此功能正在开发中，将用于查看历史数据和归档记录。</p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
