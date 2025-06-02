import React, { useEffect, useState } from 'react';
import { useDeviceDetection } from './hooks/useDeviceDetection';

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
  reviewer: string;
  date: string;
  created_at?: string;
  operator?: string;
}

const MobileStudentScore: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const deviceInfo = useDeviceDetection();

  const fetchData = async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // 获取学生信息
      const studentRes = await fetch(`/api/student/info?studentId=${encodeURIComponent(currentUser)}`);
      const studentData = await studentRes.json();
      
      if (studentData.student) {
        setStudent(studentData.student);
        // 获取分值变更记录
        const recordsRes = await fetch(`/api/student/score-records?studentId=${encodeURIComponent(currentUser)}`);
        const recordsData = await recordsRes.json();
        console.log('学生分值记录数据:', recordsData);
        setRecords(recordsData.records || []);
      } else {
        throw new Error('未找到学生信息');
      }
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };
  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '100vh', 
        background: '#f7f7f7', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          fontSize: deviceInfo.isMobile ? '18px' : '20px', 
          color: '#888',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          加载中...
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '100vh', 
        background: '#f7f7f7', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          fontSize: deviceInfo.isMobile ? '16px' : '18px', 
          color: '#d32f2f' 
        }}>
          未找到学生信息
        </div>
      </div>
    );
  }

  // 移动端样式
  const mobileStyles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      background: '#f7f7f7',
      padding: deviceInfo.isMobile ? '16px 12px' : '20px 16px'
    },
    content: {
      maxWidth: deviceInfo.isMobile ? '100%' : '600px',
      width: '100%',
      background: '#fff',
      borderRadius: deviceInfo.isMobile ? '8px' : '12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      padding: deviceInfo.isMobile ? '20px 16px' : '32px 24px',
      margin: '0 auto',
      boxSizing: 'border-box' as const
    },
    title: {
      textAlign: 'center' as const,
      fontWeight: 700,
      fontSize: deviceInfo.isMobile ? '24px' : '28px',
      marginBottom: deviceInfo.isMobile ? '24px' : '32px',
      color: '#1a237e',
      letterSpacing: '1px'
    },
    infoCard: {
      background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
      borderRadius: deviceInfo.isMobile ? '8px' : '12px',
      padding: deviceInfo.isMobile ? '20px 16px' : '24px 20px',
      marginBottom: deviceInfo.isMobile ? '24px' : '32px',
      border: '2px solid #e3f2fd'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: deviceInfo.isMobile ? '1fr 1fr' : 'repeat(2, 1fr)',
      gap: deviceInfo.isMobile ? '16px' : '20px',
      alignItems: 'center'
    },
    infoItem: {
      textAlign: 'center' as const
    },
    infoLabel: {
      fontSize: deviceInfo.isMobile ? '14px' : '16px',
      color: '#666',
      marginBottom: '6px'
    },
    infoValue: {
      fontSize: deviceInfo.isMobile ? '18px' : '20px',
      fontWeight: 600,
      color: '#333'
    },
    scoreValue: {
      fontSize: deviceInfo.isMobile ? '28px' : '32px',
      fontWeight: 700,
      color: student.score >= 80 ? '#388e3c' : student.score >= 60 ? '#f57c00' : '#d32f2f'
    },
    sectionTitle: {
      fontWeight: 600,
      fontSize: deviceInfo.isMobile ? '18px' : '20px',
      marginBottom: deviceInfo.isMobile ? '16px' : '20px',
      color: '#1a237e'
    },
    recordCard: {
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: deviceInfo.isMobile ? '16px' : '20px',
      marginBottom: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    recordHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    recordTime: {
      fontSize: deviceInfo.isMobile ? '12px' : '14px',
      color: '#666'
    },
    recordDelta: {
      fontSize: deviceInfo.isMobile ? '16px' : '18px',
      fontWeight: 600
    },
    recordReason: {
      fontSize: deviceInfo.isMobile ? '14px' : '15px',
      color: '#555',
      marginBottom: '8px',
      lineHeight: 1.4
    },
    recordOperator: {
      fontSize: deviceInfo.isMobile ? '12px' : '13px',
      color: '#888',
      textAlign: 'right' as const
    },
    noRecords: {
      textAlign: 'center' as const,
      padding: deviceInfo.isMobile ? '40px 20px' : '60px 20px',
      color: '#bbb',
      fontSize: deviceInfo.isMobile ? '16px' : '18px'
    },    viewMoreButton: {
      width: '100%',
      padding: deviceInfo.isMobile ? '12px' : '16px',
      background: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: deviceInfo.isMobile ? '16px' : '18px',
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: '16px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  };

  // 显示的记录数量（移动端显示较少）
  const displayRecords = showAllRecords ? records : records.slice(0, deviceInfo.isMobile ? 3 : 5);
  return (
    <div style={mobileStyles.container}>
      <div style={mobileStyles.content}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: deviceInfo.isMobile ? '20px' : '24px'
        }}>
          <h2 style={mobileStyles.title}>我的平时分</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: refreshing ? '#ccc' : '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: deviceInfo.isMobile ? '8px 12px' : '10px 16px',
              fontSize: deviceInfo.isMobile ? '12px' : '14px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              display: 'inline-block'
            }}>
              🔄
            </span>
            {refreshing ? '刷新中...' : '刷新'}
          </button>
        </div>
        
        {/* 学生信息卡片 */}
        <div style={mobileStyles.infoCard}>
          <div style={mobileStyles.infoGrid}>
            <div style={mobileStyles.infoItem}>
              <div style={mobileStyles.infoLabel}>学号</div>
              <div style={mobileStyles.infoValue}>{student.id}</div>
            </div>
            <div style={mobileStyles.infoItem}>
              <div style={mobileStyles.infoLabel}>姓名</div>
              <div style={mobileStyles.infoValue}>{student.name}</div>
            </div>
            <div style={mobileStyles.infoItem}>
              <div style={mobileStyles.infoLabel}>班级</div>
              <div style={mobileStyles.infoValue}>{student.grade}级{student.class}班</div>
            </div>
            <div style={mobileStyles.infoItem}>
              <div style={mobileStyles.infoLabel}>当前分值</div>
              <div style={mobileStyles.scoreValue}>{student.score}</div>
            </div>
          </div>
        </div>

        {/* 分值变更记录 */}
        <h3 style={mobileStyles.sectionTitle}>分值变更记录</h3>
        
        {records.length === 0 ? (
          <div style={mobileStyles.noRecords}>
            暂无分值变更记录
          </div>
        ) : (
          <>
            {displayRecords.map(record => (
              <div key={record.id} style={mobileStyles.recordCard}>
                <div style={mobileStyles.recordHeader}>
                  <div style={mobileStyles.recordTime}>
                    {record.date ? new Date(record.date).toLocaleString('zh-CN', { 
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : (record.created_at ? new Date(record.created_at).toLocaleString('zh-CN', { 
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-')}
                  </div>
                  <div 
                    style={{
                      ...mobileStyles.recordDelta,
                      color: record.delta > 0 ? '#388e3c' : '#d32f2f'
                    }}
                  >
                    {record.delta > 0 ? '+' : ''}{record.delta}
                  </div>
                </div>
                <div style={mobileStyles.recordReason}>
                  {record.reason}
                </div>
                <div style={mobileStyles.recordOperator}>
                  操作人：{record.reviewer || (record.operator ? (record.operator === 'admin' ? '管理员' : record.operator) : '系统')}
                </div>
              </div>
            ))}
              {/* 查看更多按钮 */}
            {records.length > (deviceInfo.isMobile ? 3 : 5) && (
              <button
                style={mobileStyles.viewMoreButton}
                onClick={() => setShowAllRecords(!showAllRecords)}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = '#1565c0';
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = '#1976d2';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {showAllRecords ? '收起记录 ⬆️' : `查看全部记录 ⬇️ (${records.length} 条)`}
              </button>
            )}
          </>
        )}        {/* 设备信息显示（调试用，生产环境可删除） */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <div><strong>设备类型:</strong> {deviceInfo.isMobile ? '手机' : deviceInfo.isTablet ? '平板' : '桌面'}</div>
            <div><strong>屏幕尺寸:</strong> {deviceInfo.screenWidth} × {deviceInfo.screenHeight}</div>
            <div><strong>方向:</strong> {deviceInfo.orientation === 'portrait' ? '竖屏' : '横屏'}</div>
            <div><strong>平台:</strong> {deviceInfo.platform}</div>
          </div>
        )}
      </div>
      
      {/* 添加旋转动画样式 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MobileStudentScore;
