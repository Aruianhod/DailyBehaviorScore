import React, { useEffect, useState } from 'react';

interface ApplicationRecord {
  id: number;
  student_id: string;
  student_name: string;
  delta: number;
  reason: string;
  date: string;
  status: '待审核' | '已通过' | '已驳回';
  reviewer?: string;
  reviewed_at?: string;
  reject_reason?: string;
}

const statusColor = {
  '待审核': '#1976d2',
  '已通过': '#388e3c',
  '已驳回': '#d32f2f',
};

const TeacherHistory: React.FC = () => {
  const [records, setRecords] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 从localStorage获取当前用户信息
    const currentUser = localStorage.getItem('currentUser') || 'teacher1'; // 默认用户
    fetch(`/api/teacher/applications/history?user=${encodeURIComponent(currentUser)}`)
      .then(res => res.json())
      .then(data => {
        setRecords(data.applications || []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f7f7f7' }}>
      <div style={{ 
        width: '100%', 
        background: '#fff', 
        margin: '0 24px', 
        borderRadius: 8, 
        boxShadow: '0 2px 12px #e0e0e0', 
        padding: '32px 24px',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ 
          textAlign: 'left', 
          fontWeight: 700, 
          fontSize: 28, 
          marginBottom: 32, 
          letterSpacing: 2, 
          color: '#1a237e' 
        }}>
          历史提交记录
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', fontSize: 20, color: '#888', margin: '60px 0' }}>
            加载中...
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            overflowX: 'auto',
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 8
          }}>
            <table style={{ 
              width: '100%', 
              minWidth: 1200, 
              borderCollapse: 'separate', 
              borderSpacing: 0, 
              fontSize: 15, 
              background: '#fff'
            }}>
              <thead>
                <tr style={{ 
                  background: '#f8faff', 
                  borderBottom: '2px solid #e3f2fd', 
                  textAlign: 'center', 
                  height: 50 
                }}>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '12%', minWidth: 100 }}>学号</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '8%', minWidth: 80 }}>姓名</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '8%', minWidth: 80 }}>分值变动</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '20%', minWidth: 180 }}>原因</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '10%', minWidth: 100 }}>提交时间</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '8%', minWidth: 80 }}>处理状态</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '8%', minWidth: 70 }}>处理人</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '10%', minWidth: 100 }}>处理时间</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#d32f2f', padding: '12px 8px', width: '16%', minWidth: 120 }}>驳回理由</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ 
                      textAlign: 'center', 
                      padding: 60, 
                      color: '#bbb', 
                      fontSize: 16 
                    }}>
                      暂无历史记录
                    </td>
                  </tr>
                )}
                {records.map(rec => (
                  <tr 
                    key={rec.id} 
                    style={{ 
                      borderBottom: '1px solid #eee', 
                      textAlign: 'center', 
                      height: 48, 
                      transition: 'background-color 0.2s' 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8faff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ fontSize: 14, color: '#333', padding: '8px', wordBreak: 'break-all' }}>
                      {rec.student_id}
                    </td>
                    <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>
                      {rec.student_name}
                    </td>
                    <td style={{ 
                      fontWeight: 600, 
                      color: rec.delta > 0 ? '#1976d2' : '#d32f2f', 
                      fontSize: 15, 
                      padding: '8px' 
                    }}>
                      {rec.delta > 0 ? '+' : ''}{rec.delta}
                    </td>
                    <td style={{ 
                      fontSize: 14, 
                      color: '#555', 
                      padding: '8px', 
                      wordBreak: 'break-word', 
                      textAlign: 'left', 
                      lineHeight: 1.4 
                    }}>
                      {rec.reason}
                    </td>
                    <td style={{ fontSize: 13, color: '#666', padding: '8px' }}>
                      {rec.date ? rec.date.slice(0, 10) : '-'}
                    </td>
                    <td style={{ 
                      fontWeight: 600, 
                      color: statusColor[rec.status], 
                      fontSize: 14, 
                      padding: '8px' 
                    }}>
                      {rec.status}
                    </td>
                    <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>
                      {rec.reviewer || '-'}
                    </td>
                    <td style={{ fontSize: 13, color: '#666', padding: '8px' }}>
                      {rec.reviewed_at ? rec.reviewed_at.slice(0, 10) : '-'}
                    </td>
                    <td style={{ 
                      fontSize: 13, 
                      color: '#d32f2f', 
                      padding: '8px', 
                      wordBreak: 'break-word', 
                      textAlign: 'left' 
                    }}>
                      {rec.reject_reason || '-'}
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

export default TeacherHistory;
