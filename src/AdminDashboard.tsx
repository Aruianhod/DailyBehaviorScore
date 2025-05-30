import React, { useState } from 'react';
import StudentTable from './StudentTable';
import AdminReview from './AdminReview';

const AdminDashboard: React.FC = () => {
  const [page, setPage] = useState<'menu' | 'students' | 'review'>('menu');

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #eee', padding: 32 }}>
      {page === 'menu' && (
        <>
          <h2>管理员功能</h2>
          <button style={{ marginRight: 24, padding: '8px 32px' }} onClick={() => setPage('students')}>查看学生信息</button>
          <button style={{ padding: '8px 32px' }} onClick={() => setPage('review')}>审查功能</button>
        </>
      )}
      {page === 'students' && (
        <>
          <button style={{ marginBottom: 16 }} onClick={() => setPage('menu')}>← 返回</button>
          <StudentTable />
        </>
      )}
      {page === 'review' && (
        <>
          <button style={{ marginBottom: 16 }} onClick={() => setPage('menu')}>← 返回</button>
          <AdminReview />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
