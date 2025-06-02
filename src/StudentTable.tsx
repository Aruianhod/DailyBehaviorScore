import React, { useEffect, useState } from 'react';
import AlertDialog from './components/AlertDialog';
import ConfirmDialog from './components/ConfirmDialog';
import InputDialog from './components/InputDialog';
import { useDialog } from './hooks/useDialog';

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
  const [recordPage, setRecordPage] = useState(1);
  const recordPageSize = 10;
  const [loading, setLoading] = useState(false);
  const [showBatchEditDialog, setShowBatchEditDialog] = useState(false);
  
  // 使用自定义弹窗
  const { showAlert, alertState, closeAlert, showConfirm, confirmState, closeConfirm } = useDialog();

  // 获取筛选选项
  const [gradeOptions, setGradeOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);

  // 获取年级选项
  useEffect(() => {
    fetch('/api/admin/class-options')
      .then(res => res.json())
      .then(data => {
        setGradeOptions(data.grades || []);
      })
      .catch(err => {
        console.error('获取年级数据失败:', err);
        setGradeOptions(['2021', '2022', '2023', '2024']);
      });
  }, []);

  // 当年级改变时，获取对应的班级选项
  useEffect(() => {
    if (filterGrade && filterGrade !== '全部') {
      fetch(`/api/admin/class-options?grade=${filterGrade}`)
        .then(res => res.json())
        .then(data => {
          setClassOptions(data.classes || []);
          if (filterClass !== '全部') {
            setFilterClass('全部'); // 重置班级选择
          }
        })
        .catch(err => {
          console.error('获取班级数据失败:', err);
          setClassOptions([]);
        });
    } else {
      // 如果没有选择年级，获取所有班级
      fetch('/api/admin/class-options')
        .then(res => res.json())
        .then(data => {
          setClassOptions(data.classes || []);
        })
        .catch(err => {
          console.error('获取班级数据失败:', err);
          //setClassOptions(['1班', '2班', '3班', '4班', '5班']);
        });
    }
  }, [filterGrade]);

  // 自动加载学生数据 - 只有在有筛选条件时才加载
  useEffect(() => {
    if (filterGrade !== '全部' || filterClass !== '全部' || search.trim()) {
      fetchStudents();
    } else {
      // 如果没有筛选条件，清空数据
      setStudents([]);
      setSelectedIds([]);
      setPage(1);
    }
  }, [filterGrade, filterClass, search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/students';
      const params = new URLSearchParams();
      
      if (filterGrade !== '全部') {
        params.append('grade', filterGrade);
      }
      if (filterClass !== '全部') {
        params.append('class', filterClass);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();
      
      // 将后端的student_id映射为前端的id字段
      const mappedStudents = (data.students || []).map((s: any) => ({
        id: s.student_id,
        name: s.name,
        grade: s.grade,
        class: s.class,
        score: s.score
      }));
      setStudents(mappedStudents);
      setPage(1); // 重置分页
    } catch (err) {
      console.error('获取学生数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

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
      fetchStudents(); // 重新获取数据
    }
    setMessage(result.message);
  };
  // 查看记录
  const handleShowRecords = async (student_id: string) => {
    setShowRecordModal(student_id);
    setRecordPage(1); // 重置记录页码
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
    
    const confirmed = await showConfirm(
      '确定要删除选中的学生吗？',
      '此操作不可撤销，请谨慎操作。',
      'danger'
    );
    
    if (!confirmed) return;
    
    try {
      const res = await fetch('/api/admin/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const result = await res.json();
      setSelectedIds([]);
      fetchStudents(); // 重新加载数据
      
      if (res.ok) {
        showAlert('删除成功: ' + result.message, '删除成功', 'success');
      } else {
        showAlert('删除失败: ' + result.message, '删除失败', 'error');
      }
    } catch (error) {
      showAlert('网络错误，请稍后重试', '删除失败', 'error');
    }
  };
  const handleBatchEdit = async (delta: number, reason: string) => {
    if (!selectedIds.length) return;
    if (!reason.trim() || isNaN(delta)) { 
      showAlert('请填写原因和分值', '参数错误', 'warning'); 
      return; 
    }
    
    try {
      const res = await fetch('/api/admin/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedIds, delta, reason, operator: 'admin' })
      });
      const result = await res.json();
      setSelectedIds([]);
      fetchStudents(); // 重新加载数据
      
      if (res.ok) {
        showAlert('批量修改成功: ' + result.message, '批量修改成功', 'success');
      } else {
        showAlert('批量修改失败: ' + result.message, '批量修改失败', 'error');
      }
    } catch (error) {
      showAlert('网络错误，请稍后重试', '批量修改失败', 'error');
    }
  };

  const totalPages = Math.ceil(searchedStudents.length / pageSize);
  const pagedStudents = searchedStudents.slice((page - 1) * pageSize, page * pageSize);

  // 记录分页逻辑
  const totalRecordPages = Math.ceil(records.length / recordPageSize);
  const pagedRecords = records.slice((recordPage - 1) * recordPageSize, recordPage * recordPageSize);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1500, width: '100%', background: '#fff', borderRadius: 8, padding: '48px 56px', margin: '0 auto', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'left', fontWeight: 700, fontSize: 28, marginBottom: 36, letterSpacing: 2, color: '#1a237e' }}>学生信息</h2>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 16, marginBottom: 24, maxWidth: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span style={{ marginRight: 8, fontSize: 16, fontWeight: 500 }}>年级：</span>
            <select
              value={filterGrade}
              onChange={e => { 
                setFilterGrade(e.target.value); 
                setFilterClass('全部');
              }}
              style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6 }}>
              <option value="全部">全部</option>
              {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span style={{ marginLeft: 12, marginRight: 8, fontSize: 16, fontWeight: 500 }}>班级：</span>
            <select
              value={filterClass}
              onChange={e => {
                setFilterClass(e.target.value);
              }}
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
            onClick={() => setShowBatchEditDialog(true)}
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
              {pagedStudents.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} style={{ 
                    textAlign: 'center', 
                    padding: 60, 
                    color: '#bbb', 
                    fontSize: 18 
                  }}>
                    {filterGrade !== '全部' || filterClass !== '全部' ? '未找到符合条件的学生信息' : '请选择筛选条件查看学生信息'}
                  </td>
                </tr>
              ) : null}
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
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 12, 
              padding: '32px', 
              width: '90%',
              maxWidth: '700px',
              maxHeight: '80vh',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <button 
                style={{ 
                  position: 'absolute', 
                  right: 20, 
                  top: 20, 
                  fontSize: 24, 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer',
                  color: '#666',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} 
                onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                onClick={() => setShowRecordModal(null)}
              >
                ×
              </button>
              
              <h3 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600, color: '#1976d2' }}>
                分值变动记录 ({records.length} 条)
              </h3>
              
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflowY: 'auto', flex: 1, marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ 
                          width: '25%', 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: '#555',
                          borderBottom: '2px solid #e9ecef'
                        }}>
                          时间
                        </th>
                        <th style={{ 
                          width: '15%', 
                          padding: '12px 8px', 
                          textAlign: 'center', 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: '#555',
                          borderBottom: '2px solid #e9ecef'
                        }}>
                          变动
                        </th>
                        <th style={{ 
                          width: '20%', 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: '#555',
                          borderBottom: '2px solid #e9ecef'
                        }}>
                          操作人
                        </th>
                        <th style={{ 
                          width: '40%', 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: '#555',
                          borderBottom: '2px solid #e9ecef'
                        }}>
                          原因
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRecords.map((r, index) => (
                        <tr key={r.id} style={{ 
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}>
                          <td style={{ 
                            padding: '12px 8px', 
                            fontSize: 14, 
                            color: '#666',
                            fontFamily: 'monospace'
                          }}>
                            {(r.created_at || r.date)?.replace('T', ' ').slice(0, 19)}
                          </td>
                          <td style={{ 
                            padding: '12px 8px', 
                            textAlign: 'center',
                            fontSize: 15,
                            fontWeight: 600,
                            color: r.delta > 0 ? '#4caf50' : '#f44336'
                          }}>
                            {r.delta > 0 ? '+' : ''}{r.delta}
                          </td>
                          <td style={{ 
                            padding: '12px 8px', 
                            fontSize: 14, 
                            color: '#333'
                          }}>
                            {r.operator}
                          </td>
                          <td style={{ 
                            padding: '12px 8px', 
                            fontSize: 14, 
                            color: '#333',
                            wordBreak: 'break-word'
                          }}>
                            {r.reason}
                          </td>
                        </tr>
                      ))}
                      {records.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ 
                            color: '#888', 
                            textAlign: 'center', 
                            padding: '40px 8px',
                            fontSize: 16
                          }}>
                            暂无记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* 分页控件 */}
                {totalRecordPages > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 12,
                    paddingTop: 16,
                    borderTop: '1px solid #e9ecef'
                  }}>
                    <button 
                      onClick={() => setRecordPage(p => Math.max(1, p - 1))} 
                      disabled={recordPage === 1}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        background: recordPage === 1 ? '#f5f5f5' : '#fff',
                        color: recordPage === 1 ? '#999' : '#333',
                        cursor: recordPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 500
                      }}
                    >
                      上一页
                    </button>
                    
                    <span style={{ 
                      fontSize: 14, 
                      color: '#666',
                      margin: '0 8px'
                    }}>
                      第 {recordPage} / {totalRecordPages} 页 (共 {records.length} 条)
                    </span>
                    
                    <button 
                      onClick={() => setRecordPage(p => Math.min(totalRecordPages, p + 1))} 
                      disabled={recordPage === totalRecordPages}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        background: recordPage === totalRecordPages ? '#f5f5f5' : '#fff',
                        color: recordPage === totalRecordPages ? '#999' : '#333',
                        cursor: recordPage === totalRecordPages ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 500
                      }}
                    >
                      下一页
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 对话框组件 */}
      <AlertDialog
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
      
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        type={confirmState.type}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
      
      <InputDialog
        isOpen={showBatchEditDialog}
        title="批量修改分值"
        onClose={() => setShowBatchEditDialog(false)}
        onConfirm={handleBatchEdit}
        deltaLabel="分值变动"
        reasonLabel="修改原因"
        deltaPlaceholder="请输入分值变动（正负均可）"
        reasonPlaceholder="请输入修改原因"
      />
    </div>
  );
};

export default StudentTable;
