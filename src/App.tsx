import { useState } from 'react';
import Login from './Login';
import AdminImport from './AdminImport';
import AdminDashboard from './AdminDashboard';
import TeacherApply from './TeacherApply';
import TeacherHistory from './TeacherHistory';
import TeacherViewStudents from './TeacherViewStudents';
import TeacherChangePassword from './TeacherChangePassword';
import StudentScore from './StudentScore';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [teacherPage, setTeacherPage] = useState<'menu' | 'apply' | 'history' | 'students' | 'password'>('menu');

  // 退出登录函数
  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('tokenExpire');
  };

  if (!token) {
    return <Login onLogin={(type, t) => { setUserType(type); setToken(t); }} />;
  }

  if (userType === 'admin') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: '#fff' }}>
        {/* 顶部栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#fff', boxShadow: '0 2px 8px #eee' }}>
          <div>
            <button onClick={() => setShowImport(true)} style={{ fontWeight: 600, fontSize: 16 }}>导入学生信息</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>欢迎，管理员！</span>
            <button onClick={handleLogout} style={{ fontWeight: 500, fontSize: 15, color: '#1976d2', background: 'none', border: '1px solid #1976d2', borderRadius: 6, padding: '6px 18px', marginLeft: 12, cursor: 'pointer' }}>退出登录</button>
          </div>
        </div>
        {/* 导入弹窗 */}
        {showImport && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 4px 24px #aaa', position: 'relative' }}>
              <button style={{ position: 'absolute', right: 16, top: 16, fontSize: 18, border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setShowImport(false)}>×</button>
              <AdminImport onImportSuccess={() => { setShowImport(false); }} />
            </div>
          </div>
        )}
        {/* 主区域 */}
        <AdminDashboard />
      </div>
    );
  }

  if (userType === 'teacher') {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f7f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#fff', boxShadow: '0 2px 8px #eee' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>欢迎，老师！</div>
          <button onClick={handleLogout} style={{ fontWeight: 500, fontSize: 15, color: '#1976d2', background: 'none', border: '1px solid #1976d2', borderRadius: 6, padding: '6px 18px', marginLeft: 12, cursor: 'pointer' }}>退出登录</button>
        </div>
        {teacherPage === 'history' ? (
          // 历史记录页面使用全宽布局
          <div>
            <div style={{ padding: '20px 24px 0 24px' }}>
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
                onClick={() => setTeacherPage('menu')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
              >
                <span>←</span> 返回主页
              </button>
            </div>
            <TeacherHistory />
          </div>
        ) : teacherPage === 'students' ? (
          // 查看学生信息页面使用全宽布局
          <div>
            <div style={{ padding: '20px 24px 0 24px' }}>
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
                onClick={() => setTeacherPage('menu')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
              >
                <span>←</span> 返回主页
              </button>
            </div>
            <TeacherViewStudents />
          </div>
        ) : (
          // 其他页面使用固定宽度
          <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 0, overflow: 'hidden' }}>
            {teacherPage === 'menu' && (
              <div>
                {/* 头部欢迎区域 */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
                  color: '#fff', 
                  padding: '32px 40px', 
                  textAlign: 'center' 
                }}>
                  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
                    教师工作台
                  </h1>
                  <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>
                    日常行为分管理系统
                  </p>
                </div>

                {/* 功能卡片区域 */}
                <div style={{ padding: '40px' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: 24,
                    maxWidth: 600,
                    margin: '0 auto'
                  }}>
                    {/* 提交申请卡片 */}
                    <div 
                      style={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 12, 
                        padding: 24, 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      onClick={() => setTeacherPage('apply')}
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
                        <span style={{ fontSize: 24, color: '#1976d2' }}>📝</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1976d2', marginBottom: 8 }}>
                        提交分值修改申请
                      </h3>
                      <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                        为学生提交分值修改申请，包含分值变更和修改原因
                      </p>
                    </div>

                    {/* 历史记录卡片 */}
                    <div 
                      style={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 12, 
                        padding: 24, 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      onClick={() => setTeacherPage('history')}
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
                        <span style={{ fontSize: 24, color: '#388e3c' }}>📋</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#388e3c', marginBottom: 8 }}>
                        历史提交记录
                      </h3>
                      <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                        查看已提交的申请记录及审核状态，跟踪申请进度
                      </p>
                    </div>

                    {/* 查看学生信息卡片 */}
                    <div 
                      style={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 12, 
                        padding: 24, 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      onClick={() => setTeacherPage('students')}
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
                        <span style={{ fontSize: 24, color: '#f57c00' }}>👥</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#f57c00', marginBottom: 8 }}>
                        查看学生信息
                      </h3>
                      <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                        浏览学生详细信息，按年级班级筛选，支持数据导出
                      </p>
                    </div>

                    {/* 修改密码卡片 */}
                    <div 
                      style={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 12, 
                        padding: 24, 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      onClick={() => setTeacherPage('password')}
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
                        <span style={{ fontSize: 24, color: '#7b1fa2' }}>🔐</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#7b1fa2', marginBottom: 8 }}>
                        修改密码
                      </h3>
                      <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                        更改账户登录密码，保障账户安全
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {teacherPage === 'apply' && (
              <div style={{ padding: '32px 40px' }}>
                <button 
                  style={{ 
                    marginBottom: 24, 
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
                  onClick={() => setTeacherPage('menu')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                  }}
                >
                  <span>←</span> 返回主页
                </button>
                <TeacherApply onSuccess={() => setTeacherPage('menu')} />
              </div>
            )}
            {teacherPage === 'password' && (
              <div style={{ padding: '32px 40px' }}>
                <button 
                  style={{ 
                    marginBottom: 24, 
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
                  onClick={() => setTeacherPage('menu')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                  }}
                >
                  <span>←</span> 返回主页
                </button>
                <TeacherChangePassword onSuccess={() => setTeacherPage('menu')} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (userType === 'student') {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f7f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#fff', boxShadow: '0 2px 8px #eee' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>欢迎，学生！</div>
          <button onClick={handleLogout} style={{ fontWeight: 500, fontSize: 15, color: '#1976d2', background: 'none', border: '1px solid #1976d2', borderRadius: 6, padding: '6px 18px', marginLeft: 12, cursor: 'pointer' }}>退出登录</button>
        </div>
        <StudentScore />
      </div>
    );
  }

  return null;
}

export default App;
