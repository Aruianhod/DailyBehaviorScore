import React, { useState } from 'react';
import StudentTable from './StudentTable';
import AdminReview from './AdminReview';
import TeacherManagement from './TeacherManagement';

const AdminDashboard: React.FC = () => {
  const [page, setPage] = useState<'menu' | 'students' | 'review' | 'teachers'>('menu');

  return (
    <div style={{ maxWidth: 2000, margin: '40px auto', background: '#fff', borderRadius: 6, boxShadow: '0 2px 8px #e5e7eb', padding: '32px 40px 40px 40px', minHeight: 320 }}>
      {page === 'menu' && (
        <>
          <h2 style={{ textAlign: 'left', fontSize: 28, fontWeight: 1000, marginBottom: 36, letterSpacing: 1 }}>管理员功能</h2>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'center', justifyContent: 'flex-start', marginBottom: 12 }}>
            <button style={{ minWidth: 160, fontSize: 18, padding: '14px 0' }} onClick={() => setPage('students')}>查看学生信息</button>
            <button style={{ minWidth: 160, fontSize: 18, padding: '14px 0' }} onClick={() => setPage('review')}>审查功能</button>
            <button style={{ minWidth: 160, fontSize: 18, padding: '14px 0' }} onClick={() => setPage('teachers')}>老师账号管理</button>
          </div>
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
      {page === 'teachers' && (
        <>
          <button style={{ marginBottom: 16 }} onClick={() => setPage('menu')}>← 返回</button>
          <TeacherManagement />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
