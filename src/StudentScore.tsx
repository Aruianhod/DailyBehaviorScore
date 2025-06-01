import React, { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  grade: number;
  class: number;
  score: number;
}

interface ScoreRecord {
  id: number;
  student_id: string;
  delta: number;
  reason: string;
  reviewer: string;  // 后端返回的是 reviewer 字段
  date: string;      // 后端返回的是 date 字段
}

const StudentScore: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 获取学生信息
    fetch(`/api/student/info?studentId=${encodeURIComponent(currentUser)}`)
      .then(res => res.json())
      .then(data => {
        if (data.student) {
          setStudent(data.student);
          // 获取分值变更记录
          return fetch(`/api/student/score-records?studentId=${encodeURIComponent(currentUser)}`);
        } else {
          throw new Error('未找到学生信息');
        }
      })      .then(res => res.json())
      .then(data => {
        console.log('学生分值记录数据:', data); // 调试日志
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取数据失败:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: '#f7f7f7', padding: '32px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', fontSize: 20, color: '#888' }}>加载中...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: '#f7f7f7', padding: '32px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', fontSize: 18, color: '#d32f2f' }}>未找到学生信息</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f7f7f7', padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1200, width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #e0e0e0', padding: '48px 56px', margin: '0 auto', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'left', fontWeight: 700, fontSize: 28, marginBottom: 36, letterSpacing: 2, color: '#1a237e' }}>我的平时分</h2>
        
        {/* 学生信息卡片 */}
        <div style={{ background: '#f8faff', borderRadius: 12, padding: '32px', marginBottom: 36, border: '2px solid #e3f2fd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'center' }}>            <div>
              <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>学号</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#1976d2' }}>{student.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>姓名</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#333' }}>{student.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>年级班级</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#333' }}>{student.grade}级{student.class}班</div>
            </div>
            <div>
              <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>当前分值</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: student.score >= 80 ? '#388e3c' : student.score >= 60 ? '#f57c00' : '#d32f2f' }}>{student.score}</div>
            </div>
          </div>
        </div>

        {/* 分值变更记录 */}
        <h3 style={{ fontWeight: 600, fontSize: 22, marginBottom: 24, color: '#1a237e' }}>分值变更记录</h3>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ minWidth: 800, width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', borderRadius: 8, overflow: 'hidden', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '2px solid #e3f2fd', textAlign: 'center', height: 56 }}>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px', width: '15%' }}>变更时间</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px', width: '15%' }}>分值变动</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px', width: '50%' }}>变更原因</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px', width: '20%' }}>操作人</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 60, color: '#bbb', fontSize: 18 }}>暂无分值变更记录</td></tr>
              )}              {records.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center', height: 56 }}>                  <td style={{ fontSize: 15, color: '#666', padding: '10px' }}>
                    {record.date ? new Date(record.date).toLocaleString('zh-CN', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : (record.created_at ? new Date(record.created_at).toLocaleString('zh-CN', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-')}
                  </td>
                  <td style={{ fontWeight: 600, color: record.delta > 0 ? '#388e3c' : '#d32f2f', fontSize: 18, padding: '10px' }}>
                    {record.delta > 0 ? '+' : ''}{record.delta}
                  </td>
                  <td style={{ fontSize: 15, color: '#555', padding: '10px', wordBreak: 'break-all', textAlign: 'left' }}>
                    {record.reason}
                  </td>                  <td style={{ fontSize: 15, color: '#333', padding: '10px' }}>
                    {record.reviewer || (record.operator ? (record.operator === 'admin' ? '管理员' : record.operator) : '系统')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentScore;
