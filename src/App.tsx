import { useState } from 'react';
import Login from './Login';
import AdminImport from './AdminImport';
import AdminDashboard from './AdminDashboard';
import TeacherApply from './TeacherApply';
import TeacherHistory from './TeacherHistory';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [teacherPage, setTeacherPage] = useState<'menu' | 'apply' | 'history'>('menu');

  if (!token) {
    return <Login onLogin={(type, t) => { setUserType(type); setToken(t); }} />;
  }

  if (userType === 'admin') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: '#f7f7f7' }}>
        {/* 顶部栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#fff', boxShadow: '0 2px 8px #eee' }}>
          <div>
            <button onClick={() => setShowImport(true)} style={{ fontWeight: 600, fontSize: 16 }}>导入学生信息</button>
          </div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>欢迎，管理员！</div>
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
        </div>
        <div style={{ maxWidth: teacherPage === 'history' ? 1200 : 600, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #eee', padding: 32 }}>
          {teacherPage === 'menu' && (
            <>
              <button style={{ marginRight: 24, padding: '8px 32px' }} onClick={() => setTeacherPage('apply')}>提交分值修改申请</button>
              <button style={{ marginRight: 24, padding: '8px 32px' }} onClick={() => setTeacherPage('history')}>历史提交记录</button>
              <button style={{ padding: '8px 32px' }} disabled>查看学生信息（待开发）</button>
            </>
          )}
          {teacherPage === 'apply' && (
            <>
              <button style={{ marginBottom: 16 }} onClick={() => setTeacherPage('menu')}>← 返回</button>
              <TeacherApply onSuccess={() => setTeacherPage('menu')} />
            </>
          )}
          {teacherPage === 'history' && (
            <>
              <button style={{ marginBottom: 16 }} onClick={() => setTeacherPage('menu')}>← 返回</button>
              <TeacherHistory />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>欢迎，{userType === 'teacher' ? '老师/社团' : '学生'}！</h2>
      <p>你已成功登录。</p>
    </div>
  );
}

export default App;
