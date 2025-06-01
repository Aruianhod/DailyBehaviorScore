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
                  background: '#1976d2', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  fontWeight: 500
                }} 
                onClick={() => setTeacherPage('menu')}
              >
                ← 返回
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
                  background: '#1976d2', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  fontWeight: 500
                }} 
                onClick={() => setTeacherPage('menu')}
              >
                ← 返回
              </button>
            </div>
            <TeacherViewStudents />
          </div>
        ) : (
          // 其他页面使用固定宽度
          <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #eee', padding: 32 }}>
            {teacherPage === 'menu' && (
              <>
                <button style={{ marginRight: 24, padding: '8px 32px' }} onClick={() => setTeacherPage('apply')}>提交分值修改申请</button>
                <button style={{ marginRight: 24, padding: '8px 32px' }} onClick={() => setTeacherPage('history')}>历史提交记录</button>
                <button style={{ marginRight: 24, padding: '8px 32px' }} onClick={() => setTeacherPage('students')}>查看学生信息</button>
                <button style={{ padding: '8px 32px' }} onClick={() => setTeacherPage('password')}>修改密码</button>
              </>
            )}
            {teacherPage === 'apply' && (
              <>
                <button style={{ marginBottom: 16 }} onClick={() => setTeacherPage('menu')}>← 返回</button>
                <TeacherApply onSuccess={() => setTeacherPage('menu')} />
              </>
            )}
            {teacherPage === 'password' && (
              <>
                <button style={{ marginBottom: 16 }} onClick={() => setTeacherPage('menu')}>← 返回</button>
                <TeacherChangePassword onSuccess={() => setTeacherPage('menu')} />
              </>
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
