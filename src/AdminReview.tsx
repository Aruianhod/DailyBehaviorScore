import React, { useEffect, useState } from 'react';

interface Application {
  id: number;
  student_id: string;
  student_name: string;
  student_ids?: string[] | string;
  student_names?: string[] | string;
  delta: number;
  reason: string;
  date: string;
  status: string;
  teacher: string | null;
  created_at: string;
  reject_reason?: string;
}

const AdminReview: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingIds, setRejectingIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // 获取待审核申请
  const fetchApplications = () => {
    setLoading(true);
    fetch('/api/admin/applications')
      .then(res => res.json())
      .then(data => {
        setApplications(data.applications || []);
        setLoading(false);
      });
  };
  useEffect(() => { fetchApplications(); }, []);

  // 多选操作
  const handleSelect = (id: number) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(applications.map(a => a.id));
      setSelectAll(true);
    }
  };

  // 批量通过
  const handleBatchApprove = async () => {
    setMessage('');
    for (const id of selectedIds) {
      await fetch(`/api/admin/applications/${id}/approve`, { method: 'POST' });
    }
    setMessage('批量通过操作完成');
    setSelectedIds([]);
    setSelectAll(false);
    fetchApplications();
  };
  // 批量驳回
  const handleBatchReject = async () => {
    if (!rejectReason) { setMessage('请填写驳回理由'); return; }
    setMessage('');
    for (const id of selectedIds) {
      await fetch(`/api/admin/applications/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
    }
    setMessage('批量驳回操作完成');
    setSelectedIds([]);
    setSelectAll(false);
    setRejectReason('');
    fetchApplications();
  };  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f7f7f7', padding: '20px 40px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1440, width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)', padding: '40px', margin: '0 auto', boxSizing: 'border-box' }}><h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 36, letterSpacing: 2, color: '#1a237e' }}>待审核分值申请</h2>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', padding: '16px 24px', background: '#fafafa', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input 
              type="checkbox" 
              checked={selectAll} 
              onChange={handleSelectAll}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 600, fontSize: 15, color: '#444' }}>全选</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <button 
              style={{ 
                color: '#1976d2', 
                background: selectedIds.length ? '#e3f2fd' : '#f5f5f5', 
                border: 'none', 
                borderRadius: 6, 
                padding: '8px 24px', 
                fontWeight: 600, 
                fontSize: 15, 
                cursor: selectedIds.length ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: selectedIds.length ? '0 2px 6px rgba(25, 118, 210, 0.2)' : 'none'
              }} 
              disabled={!selectedIds.length} 
              onClick={handleBatchApprove}
            >
              批量通过
            </button>
            <button 
              style={{ 
                color: '#d32f2f', 
                background: selectedIds.length ? '#ffebee' : '#f5f5f5', 
                border: 'none', 
                borderRadius: 6, 
                padding: '8px 24px', 
                fontWeight: 600, 
                fontSize: 15, 
                cursor: selectedIds.length ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: selectedIds.length ? '0 2px 6px rgba(211, 47, 47, 0.2)' : 'none'
              }} 
              disabled={!selectedIds.length} 
              onClick={() => setRejectingIds(selectedIds)}
            >
              批量驳回
            </button>
          </div>
          {rejectingIds.length > 0 && (
            <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                placeholder="驳回理由"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ width: 180, height: 32, fontSize: 15, borderRadius: 4, border: '1px solid #ccc', padding: '0 8px' }}
              />
              <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 600 }} onClick={handleBatchReject}>确认</button>
              <button style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 600 }} onClick={() => { setRejectingIds([]); setRejectReason(''); }}>取消</button>
            </span>
          )}
        </div>        {loading ? <div style={{ textAlign: 'center', fontSize: 18, color: '#888', margin: '60px 0' }}>加载中...</div> : (
          <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', margin: '0 -40px', padding: '0 40px' }}>            <table style={{ 
                minWidth: '100%', 
                width: '100%', 
                borderCollapse: 'separate', 
                borderSpacing: 0, 
                marginTop: 0, 
                tableLayout: 'fixed',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', 
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative'
              }}>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '23%' }} />
              </colgroup>
              <thead>
                <tr style={{ 
                  background: '#f8faff', 
                  borderBottom: '2px solid #e3f2fd', 
                  textAlign: 'center', 
                  height: 56 
                }}>
                  <th style={{ padding: '12px 8px' }}></th>
                  <th style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, color: '#1976d2', padding: '12px 8px' }}>学号</th>
                  <th style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, color: '#1976d2', padding: '12px 8px' }}>姓名</th>
                  <th style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, color: '#1976d2', padding: '12px 8px' }}>分值变动</th>
                  <th style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, color: '#1976d2', padding: '12px 8px' }}>原因</th>
                  <th style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, color: '#1976d2', padding: '12px 8px' }}>申请日期</th>
                  <th style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, color: '#1976d2', padding: '12px 8px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60, color: '#bbb', fontSize: 18 }}>暂无待审核申请</td></tr>}
                {applications.map(app => (                  <tr key={app.id} style={{ 
                    borderBottom: '1px solid #f0f0f0', 
                    textAlign: 'center', 
                    height: 64,
                    backgroundColor: selectedIds.includes(app.id) ? '#f8faff' : '#fff'
                  }}>
                    <td style={{ padding: '12px 8px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(app.id)} 
                        onChange={() => handleSelect(app.id)}
                        style={{ 
                          width: 16, 
                          height: 16,
                          cursor: 'pointer' 
                        }}
                      />
                    </td>
                    <td style={{ 
                      wordBreak: 'break-all', 
                      whiteSpace: 'pre-line', 
                      fontSize: 14, 
                      color: '#333',
                      padding: '12px 8px',
                      fontFamily: 'monospace'
                    }}>
                      {(app.student_ids ? (Array.isArray(app.student_ids) ? app.student_ids : JSON.parse(app.student_ids)) : app.student_id ? [app.student_id] : []).join('\n')}
                    </td>
                    <td style={{ 
                      wordBreak: 'break-all', 
                      whiteSpace: 'pre-line', 
                      fontSize: 14, 
                      color: '#333',
                      padding: '12px 8px'
                    }}>
                      {(app.student_names ? (Array.isArray(app.student_names) ? app.student_names : JSON.parse(app.student_names)) : app.student_name ? [app.student_name] : []).join('\n')}
                    </td>
                    <td style={{ 
                      fontWeight: 600, 
                      fontSize: 15,
                      padding: '12px 8px'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 4,
                        backgroundColor: app.delta > 0 ? '#e3f2fd' : '#ffebee',
                        color: app.delta > 0 ? '#1976d2' : '#d32f2f'
                      }}>
                        {app.delta > 0 ? '+' : ''}{app.delta}
                      </span>
                    </td>
                    <td style={{ 
                      wordBreak: 'break-all', 
                      fontSize: 14,
                      color: '#555',
                      padding: '12px 16px',
                      textAlign: 'left'
                    }}>
                      {app.reason}
                    </td>
                    <td style={{ 
                      fontSize: 14,
                      color: '#666',
                      padding: '12px 8px'
                    }}>
                      {app.date}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                        <button 
                          style={{ 
                            color: '#1976d2', 
                            background: '#e3f2fd', 
                            border: 'none', 
                            borderRadius: 4, 
                            padding: '6px 16px', 
                            fontWeight: 600, 
                            fontSize: 14,
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(25, 118, 210, 0.1)',
                            transition: 'all 0.2s'
                          }} 
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#bbdefb'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                          onClick={() => { setSelectedIds([app.id]); handleBatchApprove(); }}
                        >
                          通过
                        </button>
                        <button 
                          style={{ 
                            color: '#d32f2f', 
                            background: '#ffebee', 
                            border: 'none', 
                            borderRadius: 4, 
                            padding: '6px 16px', 
                            fontWeight: 600, 
                            fontSize: 14,
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(211, 47, 47, 0.1)',
                            transition: 'all 0.2s'
                          }} 
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffcdd2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffebee'}
                          onClick={() => { setRejectingIds([app.id]); setSelectedIds([app.id]); }}
                        >
                          驳回
                        </button>
                      </div>
                      {rejectingIds.length === 1 && rejectingIds[0] === app.id && (
                        <div style={{ 
                          marginTop: 8, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8,
                          justifyContent: 'center',
                          background: '#f8f9fa',
                          padding: '8px',
                          borderRadius: 6
                        }}>
                          <input
                            placeholder="驳回理由"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            style={{ 
                              width: 140, 
                              height: 32, 
                              fontSize: 14, 
                              borderRadius: 4, 
                              border: '1px solid #ddd', 
                              padding: '0 12px',
                              outline: 'none',
                              transition: 'all 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#1976d2'}
                            onBlur={e => e.target.style.borderColor = '#ddd'}
                          />
                          <button 
                            style={{ 
                              background: '#1976d2', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: 4, 
                              padding: '6px 12px', 
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1976d2'}
                            onClick={handleBatchReject}
                          >
                            确认
                          </button>
                          <button 
                            style={{ 
                              background: '#f5f5f5', 
                              color: '#666', 
                              border: 'none', 
                              borderRadius: 4, 
                              padding: '6px 12px', 
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onClick={() => { setRejectingIds([]); setRejectReason(''); }}
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {message && <div style={{ color: message.includes('完成') ? 'green' : 'red', marginTop: 18, textAlign: 'center', fontSize: 16 }}>{message}</div>}
      </div>
    </div>
  );
};

export default AdminReview;
