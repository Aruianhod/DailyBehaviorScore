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
    fetch('/api/teacher/applications/history')
      .then(res => res.json())
      .then(data => {
        setRecords(data.applications || []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f7f7f7', padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1200, width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e0e0', padding: '32px', margin: '0 auto', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 26, marginBottom: 32, letterSpacing: 2, color: '#1a237e' }}>历史提交记录</h2>
        {loading ? (
          <div style={{ textAlign: 'center', fontSize: 18, color: '#888', margin: '60px 0' }}>加载中...</div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ minWidth: 1000, width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#f8faff', borderBottom: '2px solid #e3f2fd', textAlign: 'center', height: 52 }}>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>学号</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>姓名</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>分值变动</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>原因</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>提交时间</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>处理状态</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>处理人</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px' }}>处理时间</th>
                  <th style={{ fontSize: 15, fontWeight: 600, color: '#d32f2f', padding: '12px 8px' }}>驳回理由</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 60, color: '#bbb', fontSize: 18 }}>暂无历史记录</td></tr>
                )}
                {records.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center', height: 56 }}>
                    <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>{rec.student_id}</td>
                    <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>{rec.student_name}</td>
                    <td style={{ fontWeight: 600, color: rec.delta > 0 ? '#1976d2' : '#d32f2f', fontSize: 15, padding: '8px' }}>{rec.delta > 0 ? '+' : ''}{rec.delta}</td>
                    <td style={{ fontSize: 14, color: '#555', padding: '8px', wordBreak: 'break-all' }}>{rec.reason}</td>
                    <td style={{ fontSize: 14, color: '#666', padding: '8px' }}>{rec.date}</td>
                    <td style={{ fontWeight: 600, color: statusColor[rec.status], fontSize: 15, padding: '8px' }}>{rec.status}</td>
                    <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>{rec.reviewer || '-'}</td>
                    <td style={{ fontSize: 14, color: '#666', padding: '8px' }}>{rec.reviewed_at || '-'}</td>
                    <td style={{ fontSize: 14, color: '#d32f2f', padding: '8px' }}>{rec.reject_reason || '-'}</td>
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
