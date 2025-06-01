import React, { useState, useEffect } from 'react';

interface Teacher {
  id: number;
  username: string;
  name: string;
  created_at: string;
}

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取老师列表
  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        console.error('获取老师列表失败');
      }
    } catch (error) {
      console.error('获取老师列表出错:', error);
    }
  };
  // 添加新老师
  const addTeacher = async () => {
    if (!newUsername.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!newName.trim()) {
      setError('请输入姓名');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          name: newName.trim(),
          password: '123456' // 固定初始密码
        })
      });

      if (response.ok) {
        setNewUsername('');
        setNewName('');
        setError('');
        await fetchTeachers(); // 刷新列表
        alert('老师账号创建成功！初始密码为：123456');
      } else {
        const errorData = await response.json();
        setError(errorData.message || '创建失败');
      }
    } catch (error) {
      console.error('创建老师账号出错:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除老师账号
  const deleteTeacher = async (id: number, username: string) => {
    if (!confirm(`确定要删除老师账号 "${username}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/teachers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTeachers(); // 刷新列表
        alert('老师账号删除成功');
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除老师账号出错:', error);
      alert('网络错误，请稍后重试');
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div>
      <h3 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>老师账号管理</h3>
      
      {/* 添加新老师 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: 20, 
        borderRadius: 6, 
        marginBottom: 24,
        border: '1px solid #e9ecef'
      }}>        <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>添加新老师账号</h4>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="请输入用户名（用于登录）"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 14,
              minWidth: 200
            }}
            onKeyDown={(e) => e.key === 'Enter' && addTeacher()}
          />
          <input
            type="text"
            placeholder="请输入真实姓名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 14,
              minWidth: 150
            }}
            onKeyDown={(e) => e.key === 'Enter' && addTeacher()}
          />
          <button
            onClick={addTeacher}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 14,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '创建中...' : '创建账号'}
          </button>
        </div>
        {error && (
          <div style={{ 
            color: '#dc3545', 
            fontSize: 14, 
            marginTop: 8,
            padding: '4px 0'
          }}>
            {error}
          </div>
        )}
        <div style={{ 
          fontSize: 12, 
          color: '#6c757d', 
          marginTop: 8 
        }}>
          * 初始密码将设置为：123456
        </div>
      </div>

      {/* 老师列表 */}
      <div>
        <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>现有老师账号</h4>
        {teachers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            padding: 40,
            background: '#f8f9fa',
            borderRadius: 6
          }}>
            暂无老师账号
          </div>
        ) : (
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: 6,
            overflow: 'hidden'
          }}>            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #ddd',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    用户名
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #ddd',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    姓名
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #ddd',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    创建时间
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #ddd',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {teacher.username}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>
                      {teacher.name || teacher.username}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6c757d' }}>
                      {new Date(teacher.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteTeacher(teacher.id, teacher.username)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherManagement;
