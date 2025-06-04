import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Progress,
  Spin,
  Alert,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { studentApi, applicationApi, recordApi } from '../../api';
import { ScoreApplication } from '../../types';
import { APPLICATION_STATUS_TEXT, APPLICATION_STATUS_COLOR } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const { Title, Text } = Typography;

interface DashboardStats {
  totalStudents: number;
  pendingApplications: number;
  approvedApplications: number;
  totalRecords: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalRecords: 0,
  });
  const [recentApplications, setRecentApplications] = useState<ScoreApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const [studentsRes, applicationsRes, recordsRes] = await Promise.all([
        studentApi.getStudents({ page: 1, pageSize: 1 }),
        applicationApi.getApplicationStats(),
        recordApi.getRecordStats(),
      ]);

      if (studentsRes.success && applicationsRes.success && recordsRes.success) {
        setStats({
          totalStudents: studentsRes.data?.total || 0,
          pendingApplications: applicationsRes.data?.pending || 0,
          approvedApplications: applicationsRes.data?.approved || 0,
          totalRecords: recordsRes.data?.totalRecords || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // 获取最近的申请
  const fetchRecentApplications = async () => {
    try {
      const response = await applicationApi.getApplications({
        page: 1,
        pageSize: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        setRecentApplications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent applications:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentApplications()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // 申请表格列配置
  const applicationColumns = [
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '申请教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: '当前分数',
      dataIndex: 'currentScore',
      key: 'currentScore',
      render: (score: number) => <Text strong>{score}</Text>,
    },
    {
      title: '申请分数',
      dataIndex: 'requestedScore',
      key: 'requestedScore',
      render: (score: number) => <Text strong style={{ color: '#1976d2' }}>{score}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={APPLICATION_STATUS_COLOR[status as keyof typeof APPLICATION_STATUS_COLOR]}>
          {APPLICATION_STATUS_TEXT[status as keyof typeof APPLICATION_STATUS_TEXT]}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date, 'MM-DD HH:mm'),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>管理员仪表板</Title>
        <Text type="secondary">系统概览和快速操作</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={stats.totalStudents}
              prefix={<UserOutlined style={{ color: '#1976d2' }} />}
              valueStyle={{ color: '#1976d2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待审核申请"
              value={stats.pendingApplications}
              prefix={<ClockCircleOutlined style={{ color: '#ff9800' }} />}
              valueStyle={{ color: '#ff9800' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已审核申请"
              value={stats.approvedApplications}
              prefix={<CheckCircleOutlined style={{ color: '#4caf50' }} />}
              valueStyle={{ color: '#4caf50' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="修改记录"
              value={stats.totalRecords}
              prefix={<TrophyOutlined style={{ color: '#7b1fa2' }} />}
              valueStyle={{ color: '#7b1fa2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="快速操作"
            extra={
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
                onClick={() => setShowImport(true)}
              >
                导入学生
              </Button>
            }
          >
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Button block>学生管理</Button>
              </Col>
              <Col span={12}>
                <Button block>申请审核</Button>
              </Col>
              <Col span={12}>
                <Button block>修改记录</Button>
              </Col>
              <Col span={12}>
                <Button block>系统设置</Button>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统状态">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>待处理申请</span>
                  <span>{stats.pendingApplications} 个</span>
                </div>
                <Progress 
                  percent={Math.min((stats.pendingApplications / 10) * 100, 100)} 
                  strokeColor={stats.pendingApplications > 5 ? '#ff4d4f' : '#52c41a'}
                  showInfo={false}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>系统活跃度</span>
                  <span>良好</span>
                </div>
                <Progress percent={85} strokeColor="#52c41a" showInfo={false} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>数据完整性</span>
                  <span>优秀</span>
                </div>
                <Progress percent={95} strokeColor="#1976d2" showInfo={false} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最近申请 */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>最近申请</span>
          </Space>
        }
        extra={<Button type="link">查看全部</Button>}
      >
        {recentApplications.length > 0 ? (
          <Table
            columns={applicationColumns}
            dataSource={recentApplications}
            pagination={false}
            size="small"
            rowKey="id"
          />
        ) : (
          <Alert
            message="暂无申请记录"
            description="当前没有待处理的申请"
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* 导入弹窗 - 这里应该集成之前的导入组件 */}
      {showImport && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Card
            title="导入学生信息"
            extra={
              <Button type="text" onClick={() => setShowImport(false)}>
                ×
              </Button>
            }
            style={{ minWidth: 500 }}
          >
            <Alert
              message="导入功能"
              description="此功能需要集成原有的导入组件"
              type="info"
              showIcon
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
