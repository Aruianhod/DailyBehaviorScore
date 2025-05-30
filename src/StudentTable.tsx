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
      setStudents(data.students || []);
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
    <div className="card">
      <h2>学生信息</h2>
      {/* 年级/班级筛选 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 12 }}>
          年级：
          <select value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setFilterClass('全部'); }} style={{ marginLeft: 4, marginRight: 24 }}>
            <option value="全部">全部</option>
            {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label>
          班级：
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ marginLeft: 4 }}>
            <option value="全部">全部</option>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="按姓名或学号搜索" style={{ width: 180, marginRight: 16 }} />
        <button onClick={handleBatchDelete} disabled={!selectedIds.length} style={{ marginRight: 8 }}>批量删除</button>
        <button onClick={() => {
          const delta = Number(prompt('请输入批量修改的分值变动（正负均可）'));
          const reason = prompt('请输入批量修改的原因');
          if (!isNaN(delta) && reason) handleBatchEdit(delta, reason);
        }} disabled={!selectedIds.length}>批量修改分值</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: 40, textAlign: 'center' }}>
              <input type="checkbox" checked={selectedIds.length === pagedStudents.length && pagedStudents.length > 0} onChange={e => handleSelectAll(e.target.checked)} />
            </th>
            <th style={{ width: 120, textAlign: 'left', padding: '8px 16px' }}>年级</th>
            <th style={{ width: 120, textAlign: 'left', padding: '8px 16px' }}>班级</th>
            <th style={{ width: 180, textAlign: 'left', padding: '8px 16px' }}>学号</th>
            <th style={{ width: 120, textAlign: 'left', padding: '8px 16px' }}>姓名</th>
            <th style={{ width: 120, textAlign: 'right', padding: '8px 16px' }}>日常行为分</th>
            <th style={{ width: 180, textAlign: 'center', padding: '8px 16px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {pagedStudents.map(s => (
            <tr key={s.id}>
              <td style={{ textAlign: 'center' }}>
                <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={e => handleSelectOne(s.id, e.target.checked)} />
              </td>
              <td style={{ textAlign: 'left', padding: '8px 16px' }}>{s.grade}</td>
              <td style={{ textAlign: 'left', padding: '8px 16px' }}>{s.class}</td>
              <td style={{ textAlign: 'left', padding: '8px 16px', fontFamily: 'monospace', letterSpacing: 1 }}>{s.id}</td>
              <td style={{ textAlign: 'left', padding: '8px 16px' }}>{s.name}</td>
              <td style={{ textAlign: 'right', padding: '8px 16px' }}>{s.score ?? '-'}</td>
              <td style={{ textAlign: 'center', padding: '8px 16px' }}>
                <button style={{ marginRight: 8 }} onClick={() => { setShowScoreModal(s.id); setDelta(0); setReason(''); setMessage(''); }}>修改分值</button>
                <button onClick={() => handleShowRecords(s.id)}>查看记录</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 分页控件 */}
      <div style={{ margin: '16px 0', textAlign: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一页</button>
        <span style={{ margin: '0 16px' }}>第 {page} / {totalPages || 1} 页</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>下一页</button>
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
  );
};

export default StudentTable;
