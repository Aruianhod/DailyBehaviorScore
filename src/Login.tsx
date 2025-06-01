import React, { useState } from 'react';
import './App.css';

interface LoginProps {
  onLogin: (userType: string, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  // 页面加载时自动检查localStorage
  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserType = localStorage.getItem('userType');
    const savedExpire = localStorage.getItem('tokenExpire');
    if (savedToken && savedUserType && savedExpire && Date.now() < Number(savedExpire)) {
      onLogin(savedUserType, savedToken);
    }
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        if (remember) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userType', data.userType);
          localStorage.setItem('currentUser', username);
          localStorage.setItem('tokenExpire', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('tokenExpire');
        }
        // 总是保存当前用户名，方便API调用
        localStorage.setItem('currentUser', username);
        onLogin(data.userType, data.token);
      } else {
        setError(data.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: `url('/bg/bg1.jpg') center center / cover no-repeat`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 18,
        boxShadow: '0 8px 32px #b0b0b0',
        padding: '48px 56px 40px 56px',
        minWidth: 380,
        maxWidth: 420,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img src="/vite.svg" alt="logo" style={{ width: 64, marginBottom: 12 }} />
        <h2 style={{ fontWeight: 800, fontSize: 26, color: '#1a237e', marginBottom: 8, letterSpacing: 2 }}>统一身份认证</h2>
        <div style={{ color: '#1976d2', fontWeight: 600, marginBottom: 28, fontSize: 18 }}>账号登录</div>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="请输入学号/工号"
            style={{ fontSize: 16, padding: '12px 16px', borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 0 }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
            style={{ fontSize: 16, padding: '12px 16px', borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 0 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0 0 0', height: 32, width: 'fit-content', alignSelf: 'flex-start' }}>
            <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            <label htmlFor="remember" style={{ fontSize: 15, color: '#555', whiteSpace: 'nowrap', lineHeight: '32px', verticalAlign: 'middle', marginBottom: 0 }}>7天免登录</label>
          </div>
          <button type="submit" style={{ marginTop: 12, background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '12px 0', letterSpacing: 2 }}>登 录</button>
          {error && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</div>}
        </form>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 18, fontSize: 15, color: '#1976d2' }}>
          <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>遇到问题</a>
          <span style={{ color: '#bbb' }}>|</span>
          <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>忘记密码</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
