import React, { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  grade: string;
  class: string;
  score?: number;
}

const StudentTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showScoreModal, setShowScoreModal] = useState<string | null>(null);
  const [showRecordModal, setShowRecordModal] = useState<string | null>(null);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [filterGrade, setFilterGrade] = useState('全部');
  const [filterClass, setFilterClass] = useState('全部');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const fetchStudents = () => {
    fetch('/api/admin/students').then(res => res.json()).then(data => {
      // 将后端的student_id映射为前端的id字段
      const mappedStudents = (data.students || []).map((s: any) => ({
        id: s.student_id,
        name: s.name,
        grade: s.grade,
        class: s.class,
        score: s.score
      }));
      setStudents(mappedStudents);
    });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 获取所有年级和班级选项
  const gradeOptions = Array.from(new Set(students.map(s => String(s.grade))));
  const classOptions = Array.from(new Set(students.filter(s => filterGrade === '全部' || String(s.grade) === filterGrade).map(s => String(s.class))));

  // 过滤后的学生
  const filteredStudents = students.filter(s =>
    (filterGrade === '全部' || String(s.grade) === filterGrade) &&
    (filterClass === '全部' || String(s.class) === filterClass)
  );

  // 搜索过滤
  const searchedStudents = filteredStudents.filter(s =>
    s.name.includes(search) || s.id.includes(search)
  );

  // 修改分值提交
  const handleScoreSubmit = async (student_id: string) => {
    if (!reason.trim() || isNaN(delta)) { setMessage('请填写原因和分值'); return; }
    setMessage('');
    const res = await fetch('/api/admin/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, delta, reason, operator: 'admin' })
    });
    const result = await res.json();
    console.log('分值提交后端返回:', result);
    if (res.ok) {
      setShowScoreModal(null);
      setDelta(0);
      setReason('');
      fetchStudents();
    }
    setMessage(result.message);
  };
  // 查看记录
  const handleShowRecords = async (student_id: string) => {
    setShowRecordModal(student_id);
    const res = await fetch(`/api/admin/score-records/${student_id}`);
    const data = await res.json();
    setRecords(data.records || []);
  };
  // 多选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(searchedStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };
  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm('确定要删除选中的学生吗？')) return;
    const res = await fetch('/api/admin/students', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds })
    });
    const result = await res.json();
    setSelectedIds([]);
    fetchStudents();
    alert(result.message);
  };
  const handleBatchEdit = async (delta: number, reason: string) => {
    if (!selectedIds.length) return;
    if (!reason.trim() || isNaN(delta)) { alert('请填写原因和分值'); return; }
    const res = await fetch('/api/admin/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: selectedIds, delta, reason, operator: 'admin' })
    });
    const result = await res.json();
    setSelectedIds([]);
    fetchStudents();
    alert(result.message);
  };

  const totalPages = Math.ceil(searchedStudents.length / pageSize);
  const pagedStudents = searchedStudents.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1500, width: '100%', background: '#fff', borderRadius: 8, padding: '48px 56px', margin: '0 auto', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'left', fontWeight: 700, fontSize: 28, marginBottom: 36, letterSpacing: 2, color: '#1a237e' }}>学生信息</h2>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 16, marginBottom: 24, maxWidth: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span style={{ marginRight: 8, fontSize: 16, fontWeight: 500 }}>年级：</span>
            <select
              value={filterGrade}
              onChange={e => { setFilterGrade(e.target.value); setFilterClass('全部'); }}
              style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6 }}>
              <option value="全部">全部</option>
              {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span style={{ marginLeft: 12, marginRight: 8, fontSize: 16, fontWeight: 500 }}>班级：</span>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6 }}>
              <option value="全部">全部</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="按姓名或学号搜索"
            style={{ width: 220, fontSize: 15, padding: '6px 14px', borderRadius: 6 }}
          />
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.length === 0}
            style={{ minWidth: 120, fontSize: 15, padding: '10px 0' }}>
            批量删除
          </button>
          <button
            onClick={() => {
              const input = prompt('请输入批量修改的分值变动（正负均可）');
              const delta = input !== null ? Number(input) : NaN;
              const reason = prompt('请输入批量修改的原因');
              if (!isNaN(delta) && reason) handleBatchEdit(delta, reason);
            }}
            disabled={selectedIds.length === 0}
            style={{ minWidth: 140, fontSize: 15, padding: '10px 0' }}>
            批量修改分值
          </button>
        </div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ minWidth: 1200, width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', borderRadius: 8, overflow: 'hidden', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '2px solid #e3f2fd', textAlign: 'center', height: 56 }}>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px' }}>
                  <input type="checkbox" checked={selectedIds.length === pagedStudents.length && pagedStudents.length > 0} onChange={e => handleSelectAll(e.target.checked)} />
                </th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px' }}>年级</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px' }}>班级</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px' }}>学号</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px' }}>姓名</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px' }}>日常行为分</th>
                <th style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', padding: '14px 8px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedStudents.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60, color: '#bbb', fontSize: 18 }}>暂无学生信息</td></tr>
              )}
              {pagedStudents.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center', height: 56 }}>
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={e => handleSelectOne(s.id, e.target.checked)} />
                  </td>
                  <td style={{ fontSize: 15, color: '#333', padding: '10px' }}>{s.grade}</td>
                  <td style={{ fontSize: 15, color: '#333', padding: '10px' }}>{s.class}</td>
                  <td style={{ fontSize: 15, color: '#333', padding: '10px', fontFamily: 'monospace', letterSpacing: 1 }}>{s.id}</td>
                  <td style={{ fontSize: 15, color: '#333', padding: '10px' }}>{s.name}</td>
                  <td style={{ fontWeight: 600, color: '#1976d2', fontSize: 16, padding: '10px' }}>{s.score ?? '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button style={{ minWidth: 80, padding: '6px 8px', fontSize: 14 }} onClick={() => { setShowScoreModal(s.id); setDelta(0); setReason(''); setMessage(''); }}>修改分值</button>
                      <button style={{ minWidth: 80, padding: '6px 8px', fontSize: 14 }} onClick={() => handleShowRecords(s.id)}>查看记录</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 分页控件 */}
        <div style={{ margin: '32px 0 0 0', textAlign: 'center', fontSize: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ minWidth: 90 }}>上一页</button>
          <span style={{ margin: '0 24px' }}>第 {page} / {totalPages || 1} 页</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} style={{ minWidth: 90 }}>下一页</button>
        </div>
        {/* 修改分值弹窗 */}
        {showScoreModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 4px 24px #aaa', position: 'relative' }}>
              <button style={{ position: 'absolute', right: 16, top: 16, fontSize: 18, border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setShowScoreModal(null)}>×</button>
              <h3>修改分值</h3>
              <div style={{ margin: '16px 0' }}>
                <input type="number" value={delta} onChange={e => setDelta(Number(e.target.value))} placeholder="分值变动（正负均可）" style={{ width: 180, marginRight: 8 }} />
                <input value={reason} onChange={e => setReason(e.target.value)} placeholder="原因" style={{ width: 220 }} />
              </div>
              <button style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '6px 24px', borderRadius: 4, fontWeight: 600 }} onClick={() => handleScoreSubmit(showScoreModal)}>确认</button>
              {message && <div style={{ color: 'red', marginTop: 8 }}>{message}</div>}
            </div>
          </div>
        )}
        {/* 查看记录弹窗 */}
        {showRecordModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 420, boxShadow: '0 4px 24px #aaa', position: 'relative' }}>
              <button style={{ position: 'absolute', right: 16, top: 16, fontSize: 18, border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setShowRecordModal(null)}>×</button>
              <h3>分值变动记录</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>时间</th>
                    <th style={{ width: 80 }}>变动</th>
                    <th style={{ width: 120 }}>操作人</th>
                    <th>原因</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>{r.created_at?.replace('T', ' ').slice(0, 19)}</td>
                      <td style={{ color: r.delta > 0 ? 'green' : 'red' }}>{r.delta > 0 ? '+' : ''}{r.delta}</td>
                      <td>{r.operator}</td>
                      <td>{r.reason}</td>
                    </tr>
                  ))}
                  {records.length === 0 && <tr><td colSpan={4} style={{ color: '#888', textAlign: 'center' }}>暂无记录</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTable;
