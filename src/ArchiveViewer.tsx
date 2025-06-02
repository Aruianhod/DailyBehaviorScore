import React, { useState, useEffect } from 'react';
import AlertDialog from './components/AlertDialog';
import { useDialog } from './hooks/useDialog';

interface ArchiveData {
  archiveInfo: {
    id: number;
    archiveDate: string;
    grades: string[];
    reason: string;
    createdBy: string;
    createdAt: string;
  };
  statistics: {
    studentCount: number;
    recordCount: number;
    applicationCount: number;
  };
  students?: any[];
  note?: string;
}

interface Props {
  archiveId: number;
  onClose: () => void;
}

const ArchiveViewer: React.FC<Props> = ({ archiveId, onClose }) => {
  const [archiveData, setArchiveData] = useState<ArchiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'info' | 'students' | 'raw'>('info');
  
  const { showAlert, alertState, closeAlert } = useDialog();

  useEffect(() => {
    fetchArchiveData();
  }, [archiveId]);

  const fetchArchiveData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/archive/download/${archiveId}`);
      if (response.ok) {
        const data = await response.json();
        setArchiveData(data);
      } else {
        showAlert('无法获取归档数据', '加载失败', 'error');
      }
    } catch (error) {
      console.error('获取归档数据失败:', error);
      showAlert('网络错误，请稍后重试', '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsJson = () => {
    if (!archiveData) return;
    
    const dataStr = JSON.stringify(archiveData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive_${archiveId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
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
          padding: 40,
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            border: '3px solid #007bff', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div>正在加载归档数据...</div>
        </div>
      </div>
    );
  }

  if (!archiveData) {
    return (
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
          padding: 40,
          borderRadius: 8,
          textAlign: 'center',
          maxWidth: 400
        }}>
          <h3 style={{ color: '#dc3545', marginBottom: 16 }}>❌ 加载失败</h3>
          <p>无法加载归档数据，请重试</p>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  const { archiveInfo, statistics, students, note } = archiveData;

  return (
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
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 8,
        maxWidth: 1000,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#495057' }}>
            📁 归档数据查看器 - ID: {archiveId}
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={downloadAsJson}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              📥 下载JSON
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              ✕ 关闭
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div style={{
          padding: '0 24px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          gap: 0
        }}>
          {[
            { key: 'info', label: '📊 基本信息' },
            { key: 'students', label: '👥 学生数据' },
            { key: 'raw', label: '🔧 原始数据' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: selectedTab === tab.key ? '#007bff' : 'transparent',
                color: selectedTab === tab.key ? 'white' : '#495057',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 24
        }}>
          {selectedTab === 'info' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>📋 归档信息</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 4 }}>
                    <strong>归档日期：</strong><br />
                    {new Date(archiveInfo.archiveDate).toLocaleDateString('zh-CN')}
                  </div>
                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 4 }}>
                    <strong>归档年级：</strong><br />
                    {archiveInfo.grades.join('、')}级
                  </div>
                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 4 }}>
                    <strong>归档原因：</strong><br />
                    {archiveInfo.reason || '未填写'}
                  </div>
                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 4 }}>
                    <strong>操作人员：</strong><br />
                    {archiveInfo.createdBy || '未知'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>📊 统计信息</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ textAlign: 'center', background: '#e7f3ff', padding: 16, borderRadius: 4 }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#007bff' }}>
                      {statistics.studentCount}
                    </div>
                    <div style={{ fontSize: 14, color: '#666' }}>归档学生数</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#f0f9ff', padding: 16, borderRadius: 4 }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0ea5e9' }}>
                      {statistics.recordCount}
                    </div>
                    <div style={{ fontSize: 14, color: '#666' }}>分数记录数</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#ecfdf5', padding: 16, borderRadius: 4 }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>
                      {statistics.applicationCount}
                    </div>
                    <div style={{ fontSize: 14, color: '#666' }}>申请记录数</div>
                  </div>
                </div>
              </div>

              {note && (
                <div style={{
                  padding: 12,
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: 4,
                  borderLeft: '4px solid #ff9f43'
                }}>
                  <strong>📝 备注：</strong> {note}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'students' && (
            <div>
              {students && students.length > 0 ? (
                <>
                  <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>👥 归档学生列表 ({students.length}人)</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>学号</th>
                          <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>姓名</th>
                          <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>年级</th>
                          <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>班级</th>
                          <th style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>记录数</th>
                          <th style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>申请数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr key={index}>
                            <td style={{ padding: 8, borderBottom: '1px solid #dee2e6' }}>
                              {student.student_id}
                            </td>
                            <td style={{ padding: 8, borderBottom: '1px solid #dee2e6' }}>
                              {student.name}
                            </td>
                            <td style={{ padding: 8, borderBottom: '1px solid #dee2e6' }}>
                              {student.grade}级
                            </td>
                            <td style={{ padding: 8, borderBottom: '1px solid #dee2e6' }}>
                              {student.class_name || '-'}
                            </td>
                            <td style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                              {student.records ? student.records.length : 0}
                            </td>
                            <td style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                              {student.applications ? student.applications.length : 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                  <div>此归档记录不包含详细学生数据</div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    可能是旧版本的归档记录或归档摘要
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'raw' && (
            <div>
              <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>🔧 原始JSON数据</h4>
              <pre style={{
                background: '#f8f9fa',
                padding: 16,
                borderRadius: 4,
                fontSize: 12,
                lineHeight: 1.4,
                overflow: 'auto',
                maxHeight: 400,
                border: '1px solid #dee2e6'
              }}>
                {JSON.stringify(archiveData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

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

export default ArchiveViewer;
