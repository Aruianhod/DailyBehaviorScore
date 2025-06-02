import React, { useState } from 'react';
import './App.css';
import { useDeviceDetection } from './hooks/useDeviceDetection';

interface LoginProps {
  onLogin: (userType: string, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const deviceInfo = useDeviceDetection();

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
    <div className="login-container" style={{
      minHeight: '100vh',
      width: '100vw',
      background: `url('/bg/bg1.jpg') center center / cover no-repeat`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: deviceInfo.isMobile ? '20px 16px' : '20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        borderRadius: deviceInfo.isMobile ? 12 : 18,
        boxShadow: '0 8px 32px #b0b0b0',
        padding: deviceInfo.isMobile ? '32px 24px 28px 24px' : '48px 56px 40px 56px',
        minWidth: deviceInfo.isMobile ? 'auto' : 380,
        maxWidth: deviceInfo.isMobile ? '100%' : 420,
        width: deviceInfo.isMobile ? '100%' : '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img src="/vite.svg" alt="logo" style={{ 
          width: deviceInfo.isMobile ? 48 : 64, 
          marginBottom: deviceInfo.isMobile ? 8 : 12 
        }} />
        <h2 style={{ 
          fontWeight: 800, 
          fontSize: deviceInfo.isMobile ? 22 : 26, 
          color: '#1a237e', 
          marginBottom: deviceInfo.isMobile ? 6 : 8, 
          letterSpacing: deviceInfo.isMobile ? 1.5 : 2,
          textAlign: 'center'
        }}>统一身份认证</h2>
        <div style={{ 
          color: '#1976d2', 
          fontWeight: 600, 
          marginBottom: deviceInfo.isMobile ? 20 : 28, 
          fontSize: deviceInfo.isMobile ? 16 : 18 
        }}>账号登录</div>
        <form className="login-form" onSubmit={handleSubmit} style={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: deviceInfo.isMobile ? 14 : 18 
        }}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="请输入学号/工号"
            style={{ 
              fontSize: deviceInfo.isMobile ? 16 : 16, 
              padding: deviceInfo.isMobile ? '14px 16px' : '12px 16px', 
              borderRadius: 8, 
              border: '1px solid #d1d5db', 
              marginBottom: 0,
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
            style={{ 
              fontSize: deviceInfo.isMobile ? 16 : 16, 
              padding: deviceInfo.isMobile ? '14px 16px' : '12px 16px', 
              borderRadius: 8, 
              border: '1px solid #d1d5db', 
              marginBottom: 0,
              boxSizing: 'border-box'
            }}
          />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: deviceInfo.isMobile ? '6px 0 0 0' : '8px 0 0 0', 
            height: deviceInfo.isMobile ? 28 : 32, 
            width: 'fit-content', 
            alignSelf: 'flex-start' 
          }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={remember} 
              onChange={e => setRemember(e.target.checked)} 
              style={{ 
                marginRight: 8, 
                verticalAlign: 'middle',
                transform: deviceInfo.isMobile ? 'scale(1.1)' : 'scale(1)'
              }} 
            />
            <label 
              htmlFor="remember" 
              style={{ 
                fontSize: deviceInfo.isMobile ? 14 : 15, 
                color: '#555', 
                whiteSpace: 'nowrap', 
                lineHeight: deviceInfo.isMobile ? '28px' : '32px', 
                verticalAlign: 'middle', 
                marginBottom: 0 
              }}
            >7天免登录</label>
          </div>
          <button 
            type="submit" 
            className="login-button"
            style={{ 
              marginTop: deviceInfo.isMobile ? 8 : 12, 
              background: '#1976d2', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: deviceInfo.isMobile ? 16 : 18, 
              border: 'none', 
              borderRadius: 8, 
              padding: deviceInfo.isMobile ? '14px 0' : '12px 0', 
              letterSpacing: deviceInfo.isMobile ? 1.5 : 2,
              boxSizing: 'border-box',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
          >登 录</button>
          {error && <div style={{ 
            color: 'red', 
            marginTop: deviceInfo.isMobile ? 6 : 8, 
            textAlign: 'center',
            fontSize: deviceInfo.isMobile ? 14 : 15
          }}>{error}</div>}
        </form>
        <div className="login-links" style={{ 
          marginTop: deviceInfo.isMobile ? 14 : 18, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: deviceInfo.isMobile ? 14 : 18, 
          fontSize: deviceInfo.isMobile ? 14 : 15, 
          color: '#1976d2' 
        }}>
          <a href="#" style={{ 
            color: '#1976d2', 
            textDecoration: 'underline',
            touchAction: 'manipulation'
          }}>遇到问题</a>
          <span style={{ color: '#bbb' }}>|</span>
          <a href="#" style={{ 
            color: '#1976d2', 
            textDecoration: 'underline',
            touchAction: 'manipulation'
          }}>忘记密码</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
