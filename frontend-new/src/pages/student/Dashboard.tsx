import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Statistic,
  Progress,
  Alert,
  Timeline,
  Spin,
} from 'antd';
import {
  TrophyOutlined,
  HistoryOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { studentApi, recordApi } from '../../api';
import { Student, ScoreRecord } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getRelativeTime } from '../../utils/helpers';

const { Title, Paragraph } = Typography;

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [recentRecords, setRecentRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取学生信息
  const fetchStudentInfo = async () => {
    try {
      if (state.user?.id) {
        const response = await studentApi.getStudent(state.user.id);
        if (response.success && response.data) {
          setStudent(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch student info:', error);
    }
  };

  // 获取最近的分数记录
  const fetchRecentRecords = async () => {
    try {
      if (state.user?.id) {
        const response = await recordApi.getStudentRecords(state.user.id, {
          page: 1,
          pageSize: 5,
        });
        if (response.success && response.data) {
          setRecentRecords(response.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch recent records:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudentInfo(), fetchRecentRecords()]);
      setLoading(false);
    };

    loadData();
  }, [state.user?.id]);

  // 计算分数趋势
  const getScoreTrend = () => {
    if (recentRecords.length < 2) return { trend: 'stable', change: 0 };
    
    const latest = recentRecords[0];
    const previous = recentRecords[1];
    const change = latest.newScore - previous.previousScore;
    
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change),
    };
  };

  const scoreTrend = getScoreTrend();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 欢迎区域 */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          marginBottom: 24,
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ color: 'white' }}>
          <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
            👋 你好，{student?.name || '同学'}！
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 16 }}>
            学号：{student?.studentId} | 班级：{student?.grade}-{student?.class}
          </Paragraph>
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 4 }}>
                  {student?.score || 0}
                </div>
                <div style={{ opacity: 0.9 }}>当前分数</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>
                  {scoreTrend.trend === 'up' && <RiseOutlined style={{ color: '#4caf50' }} />}
                  {scoreTrend.trend === 'down' && <FallOutlined style={{ color: '#f44336' }} />}
                  {scoreTrend.trend === 'stable' && <span>—</span>}
                  {scoreTrend.change > 0 && ` ${scoreTrend.change}`}
                </div>
                <div style={{ opacity: 0.9 }}>最近变化</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>
                  {recentRecords.length}
                </div>
                <div style={{ opacity: 0.9 }}>修改记录</div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 左侧内容 */}
        <Col xs={24} lg={16}>
          {/* 快速操作 */}
          <Card title="快速操作" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<TrophyOutlined />}
                  onClick={() => navigate('/student/score')}
                >
                  查看详细分数
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  size="large"
                  block
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/student/records')}
                >
                  分数变化记录
                </Button>
              </Col>
            </Row>
          </Card>

          {/* 分数分析 */}
          <Card title="分数分析">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Statistic
                  title="当前分数"
                  value={student?.score || 0}
                  precision={1}
                  valueStyle={{ color: '#1976d2' }}
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col xs={24} md={12}>
                <div>
                  <div style={{ marginBottom: 8 }}>分数水平</div>
                  <Progress
                    percent={Math.min(((student?.score || 0) / 100) * 100, 100)}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    format={(percent) => {
                      if (percent! >= 90) return '优秀';
                      if (percent! >= 80) return '良好';
                      if (percent! >= 70) return '中等';
                      if (percent! >= 60) return '及格';
                      return '需要努力';
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 右侧内容 */}
        <Col xs={24} lg={8}>
          {/* 最近记录 */}
          <Card title="最近记录" style={{ marginBottom: 24 }}>
            {recentRecords.length > 0 ? (
              <Timeline
                items={recentRecords.map((record) => ({
                  dot: record.newScore > record.previousScore 
                    ? <RiseOutlined style={{ color: '#4caf50' }} />
                    : <FallOutlined style={{ color: '#f44336' }} />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {record.previousScore} → {record.newScore}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        {record.changeReason}
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                        {getRelativeTime(record.changedAt)}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Alert
                message="暂无记录"
                description="还没有分数变化记录"
                type="info"
                showIcon
              />
            )}
          </Card>

          {/* 提示信息 */}
          <Card title="温馨提示">            <Space direction="vertical" size="small" style={{ width: '100%' }}>              <Alert
                message="分数查询" 
                description="点击'查看详细分数'可以看到完整的分数信息和统计"
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
              />
              <Alert
                message="记录追踪"
                description="所有分数变化都会被详细记录，包括修改时间和原因"
                type="success"
                icon={<CheckCircleOutlined />}
                showIcon
              />
              <Alert
                message="实时更新"
                description="分数信息会实时更新，如有疑问请联系相关教师"
                type="warning"
                icon={<ClockCircleOutlined />}
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
