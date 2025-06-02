import React, { useState, useEffect } from 'react';
import AlertDialog from './components/AlertDialog';
import { useDialog } from './hooks/useDialog';

interface ArchiveStats {
  totalStudents: number;
  graduatedGrades: string[];
  archivableStudents: number;
  archivableRecords: number;
  archivableApplications: number;
  estimatedSpaceSaving: string;
}

interface ArchiveLog {
  id: number;
  archive_date: string;
  grades_archived: string[] | string;
  student_count: number;
  record_count: number;
  application_count: number;
  file_size: number;
  archive_reason: string;
  created_by: string;
  created_at: string;
}

const ArchiveManagement: React.FC = () => {
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [logs, setLogs] = useState<ArchiveLog[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [archiveReason, setArchiveReason] = useState('');  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 使用自定义弹窗
  const { showAlert, alertState, closeAlert } = useDialog();
  // 获取归档统计信息
  const fetchArchiveStats = async () => {
    try {
      const response = await fetch('/api/admin/archive/stats');
      if (response.ok) {
        const data = await response.json();
        // 确保数据的完整性，避免undefined显示
        const safeStats = {
          totalStudents: data.totalStudents || 0,
          graduatedGrades: Array.isArray(data.graduatedGrades) ? data.graduatedGrades : [],
          archivableStudents: data.archivableStudents || 0,
          archivableRecords: data.archivableRecords || 0,
          archivableApplications: data.archivableApplications || 0,
          estimatedSpaceSaving: data.estimatedSpaceSaving || '0 MB'
        };
        setStats(safeStats);
      } else {
        console.error('获取归档统计失败: HTTP', response.status);
        showAlert('无法获取归档统计信息', '数据加载失败', 'error');
      }
    } catch (error) {
      console.error('获取归档统计失败:', error);
      showAlert('网络错误，请检查连接', '数据加载失败', 'error');
    }
  };  // 获取归档历史记录
  const fetchArchiveLogs = async () => {
    try {
      const response = await fetch('/api/admin/archive/logs');
      if (response.ok) {
        const data = await response.json();
        const safeLogs = (data.logs || []).map(log => ({
          ...log,
          // 确保关键字段不为undefined
          student_count: log.student_count || 0,
          record_count: log.record_count || 0,
          application_count: log.application_count || 0,
          file_size: log.file_size || 0,
          archive_reason: log.archive_reason || '未填写',
          grades_archived: log.grades_archived || []
        }));
        setLogs(safeLogs);
      } else {
        console.error('获取归档记录失败: HTTP', response.status);
        showAlert('无法获取归档历史记录', '数据加载失败', 'error');
      }
    } catch (error) {
      console.error('获取归档记录失败:', error);
      showAlert('网络错误，请检查连接', '数据加载失败', 'error');
    }
  };
  // 执行归档操作
  const performArchive = async () => {    if (!selectedGrades.length || !archiveReason.trim()) {
      showAlert('请选择要归档的年级并填写归档原因', '参数不完整', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/archive/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: selectedGrades,
          reason: archiveReason.trim()
        })
      });      const result = await response.json();      if (response.ok) {
        const stats = result.stats || {};
        const studentCount = stats.studentCount || 0;
        const recordCount = stats.recordCount || 0;
        const applicationCount = stats.applicationCount || 0;
        
        showAlert(
          `✅ 归档操作完成！\n\n` +
          `📊 归档统计：\n` +
          `• 学生数量：${studentCount} 人\n` +
          `• 分数记录：${recordCount} 条\n` +
          `• 申请记录：${applicationCount} 条\n` +
          `• 归档年级：${stats.grades ? stats.grades.join('、') : ''}级`,
          '归档成功', 
          'success'
        );
        setSelectedGrades([]);
        setArchiveReason('');
        setShowConfirm(false);
        fetchArchiveStats();
        fetchArchiveLogs();
      } else {
        showAlert(result.message || '归档操作失败', '归档失败', 'error');
      }
    } catch (error) {
      console.error('归档操作失败:', error);
      showAlert('网络错误，请稍后重试', '归档失败', 'error');
    } finally {
      setLoading(false);
    }
  };
  // 下载归档文件
  const downloadArchive = async (logId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/admin/archive/download/${logId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `archive_${logId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);      } else {
        showAlert('无法下载归档文件', '下载失败', 'error');
      }
    } catch (error) {
      console.error('下载归档文件失败:', error);
      showAlert('网络错误，请稍后重试', '下载失败', 'error');
    }
  };

  useEffect(() => {
    fetchArchiveStats();    fetchArchiveLogs();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>📁 数据归档管理</h2>

      {/* 归档统计 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 24,
        border: '1px solid #e9ecef'
      }}>        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#495057' }}>📊 系统数据统计</h3>
        {stats ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#007bff' }}>{stats.totalStudents}</div>
                <div style={{ fontSize: 14, color: '#6c757d' }}>在校学生总数</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>{stats.archivableStudents}</div>
                <div style={{ fontSize: 14, color: '#6c757d' }}>可归档学生</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ffc107' }}>{stats.archivableRecords}</div>
                <div style={{ fontSize: 14, color: '#6c757d' }}>可归档记录</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#17a2b8' }}>{stats.estimatedSpaceSaving}</div>
                <div style={{ fontSize: 14, color: '#6c757d' }}>预计节省空间</div>
              </div>
            </div>
            {stats.graduatedGrades.length > 0 && (
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: '#e7f3ff', 
                borderLeft: '4px solid #007bff',
                borderRadius: 4 
              }}>
                <strong>💡 可归档年级：</strong> {stats.graduatedGrades.join('、')} 
                <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                  （毕业满4年的学生数据）
                </span>
              </div>
            )}
            {stats.graduatedGrades.length === 0 && (
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: '#f8f9fa', 
                borderLeft: '4px solid #6c757d',
                borderRadius: 4 
              }}>
                <strong>ℹ️ 暂无可归档数据</strong>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  系统将自动检测毕业满4年的学生数据进行归档建议
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 16, 
              height: 16, 
              border: '2px solid #007bff', 
              borderTop: '2px solid transparent', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            加载统计数据中...
          </div>
        )}
      </div>

      {/* 归档操作 */}
      <div style={{ 
        background: '#fff', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 24,
        border: '1px solid #dee2e6'
      }}>        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#495057' }}>🎯 执行归档操作</h3>
        
        {/* 重要警告 */}
        <div style={{
          marginBottom: 20,
          padding: 16,
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: 6,
          borderLeft: '4px solid #ff9f43'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 18, marginRight: 8 }}>⚠️</span>
            <strong style={{ color: '#e17055', fontSize: 16 }}>重要提醒</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#6c5ce7', lineHeight: 1.6 }}>
            <li><strong>归档操作会永久删除</strong>所选年级的学生信息、分数记录和申请记录</li>
            <li>删除前系统会自动备份数据到归档文件中</li>
            <li>归档后的数据将无法在系统中查看，只能通过下载归档文件查看</li>
            <li>此操作<span style={{ color: '#e17055', fontWeight: 'bold' }}>不可撤销</span>，请谨慎操作</li>
          </ul>
        </div>
        
        {stats && stats.graduatedGrades.length > 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                选择要归档的年级（已毕业超过1年）：
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stats.graduatedGrades.map(grade => (
                  <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={selectedGrades.includes(grade)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGrades([...selectedGrades, grade]);
                        } else {
                          setSelectedGrades(selectedGrades.filter(g => g !== grade));
                        }
                      }}
                    />
                    <span>{grade}级 (毕业于{parseInt(grade) + 4}年)</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                归档原因：
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="请输入归档原因，如：例行数据归档、存储空间优化等"
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 8,
                  border: '1px solid #ced4da',
                  borderRadius: 4,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!selectedGrades.length || !archiveReason.trim() || loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedGrades.length && archiveReason.trim() ? '#dc3545' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: selectedGrades.length && archiveReason.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? '归档中...' : '开始归档'}
              </button>
              
              <button
                onClick={() => {
                  setSelectedGrades([]);
                  setArchiveReason('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                重置
              </button>
            </div>
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#6c757d',
            background: '#f8f9fa',
            borderRadius: 4
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
            <div>暂无可归档的毕业年级数据</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>
              系统会自动识别毕业超过1年的年级数据用于归档
            </div>
          </div>
        )}
      </div>

      {/* 归档历史记录 */}
      <div style={{ 
        background: '#fff', 
        padding: 20, 
        borderRadius: 8,
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#495057' }}>📋 归档历史记录</h3>
        
        {logs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>归档日期</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>归档年级</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>学生数量</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>记录数量</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>文件大小</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>归档原因</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      {log.archive_date ? new Date(log.archive_date).toLocaleDateString('zh-CN') : '-'}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      {Array.isArray(log.grades_archived) 
                        ? log.grades_archived.join('、') + '级'
                        : (typeof log.grades_archived === 'string' 
                           ? log.grades_archived 
                           : '未知')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      {log.student_count || 0}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      {log.record_count || 0}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      {log.file_size ? `${(log.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      {log.archive_reason || '未填写'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      <button
                        onClick={() => {
                          const gradesStr = Array.isArray(log.grades_archived) 
                            ? log.grades_archived.join('_') 
                            : (typeof log.grades_archived === 'string' ? log.grades_archived.replace(/,/g, '_') : 'unknown');
                          downloadArchive(log.id, `归档_${gradesStr}级_${log.archive_date}.zip`);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        下载
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#6c757d',
            background: '#f8f9fa',
            borderRadius: 4
          }}>
            暂无归档记录
          </div>
        )}
      </div>

      {/* 确认对话框 */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            maxWidth: 500,
            width: '90%'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#dc3545' }}>⚠️ 确认归档操作</h4>
            <p>您即将归档以下年级的数据：</p>
            <ul>
              {selectedGrades.map(grade => (
                <li key={grade}><strong>{grade}级</strong> (毕业于{parseInt(grade) + 4}年)</li>
              ))}
            </ul>
            <p style={{ color: '#dc3545', fontWeight: 500 }}>
              ⚠️ 注意：归档操作将从活跃数据库中移除这些数据，并生成归档文件。此操作不可逆！
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={performArchive}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '归档中...' : '确认归档'}
              </button>
            </div>          </div>
        </div>
      )}
      
      {/* 对话框组件 */}
      <AlertDialog
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </div>
  );
};

export default ArchiveManagement;
