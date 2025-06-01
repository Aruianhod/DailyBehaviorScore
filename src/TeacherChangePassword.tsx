import React, { useState } from 'react';

const TeacherChangePassword: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (message) setMessage('');
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.currentPassword.trim()) {
      setMessage('请输入当前密码');
      return;
    }

    if (!formData.newPassword.trim()) {
      setMessage('请输入新密码');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('新密码长度不能少于6位');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage('新密码不能与当前密码相同');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // 获取当前登录的老师用户名
      const currentUser = localStorage.getItem('currentUser') || 'teacher1';

      const response = await fetch('http://localhost:3000/api/teacher/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: currentUser,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('密码修改成功！');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // 延迟返回菜单
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setMessage(result.message || '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码时发生错误:', error);
      setMessage('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 480, 
      margin: '0 auto', 
      background: '#fff', 
      borderRadius: 8, 
      boxShadow: '0 2px 12px #eee', 
      padding: '40px 48px' 
    }}>
      <h3 style={{ 
        fontSize: 24, 
        fontWeight: 600, 
        marginBottom: 32, 
        textAlign: 'center',
        color: '#1976d2'
      }}>
        修改密码
      </h3>

      <div style={{ marginBottom: 24 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 8, 
          fontSize: 16, 
          fontWeight: 500,
          color: '#333'
        }}>
          当前密码：
        </label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleInputChange}
          placeholder="请输入当前密码"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 16,
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 8, 
          fontSize: 16, 
          fontWeight: 500,
          color: '#333'
        }}>
          新密码：
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          placeholder="请输入新密码（至少6位）"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 16,
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 8, 
          fontSize: 16, 
          fontWeight: 500,
          color: '#333'
        }}>
          确认新密码：
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="请再次输入新密码"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 16,
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px 0',
          backgroundColor: isLoading ? '#ccc' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: 16
        }}
      >
        {isLoading ? '修改中...' : '确认修改'}
      </button>

      {message && (
        <div style={{ 
          color: message.includes('成功') ? '#28a745' : '#dc3545', 
          fontSize: 14, 
          textAlign: 'center',
          padding: '8px 0',
          fontWeight: 500
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        fontSize: 12, 
        color: '#6c757d', 
        textAlign: 'center',
        lineHeight: 1.4
      }}>
        <p style={{ margin: '4px 0' }}>• 密码长度至少6位</p>
        <p style={{ margin: '4px 0' }}>• 新密码不能与当前密码相同</p>
        <p style={{ margin: '4px 0' }}>• 请妥善保管您的新密码</p>
      </div>
    </div>
  );
};

export default TeacherChangePassword;
