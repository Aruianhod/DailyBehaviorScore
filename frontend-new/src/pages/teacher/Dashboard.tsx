import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Divider,
} from 'antd';
import {
  FileTextOutlined,
  HistoryOutlined,
  TeamOutlined,
  UserOutlined,
  EditOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: '提交分值申请',
      description: '为学生提交分值修改申请，包含分值变更和修改原因',
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#1976d2' }} />,
      color: '#e3f2fd',
      path: '/teacher/apply',
      buttonText: '开始申请',
      buttonType: 'primary' as const,
    },
    {
      title: '查看申请记录',
      description: '查看已提交的申请记录及审核状态，跟踪申请进度',
      icon: <HistoryOutlined style={{ fontSize: 32, color: '#388e3c' }} />,
      color: '#e8f5e8',
      path: '/teacher/history',
      buttonText: '查看记录',
      buttonType: 'default' as const,
    },
    {
      title: '学生信息查询',
      description: '浏览学生详细信息，按年级班级筛选，支持数据导出',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#f57c00' }} />,
      color: '#fff3e0',
      path: '/teacher/students',
      buttonText: '查看学生',
      buttonType: 'default' as const,
    },
    {
      title: '个人资料管理',
      description: '更改账户信息和登录密码，保障账户安全',
      icon: <UserOutlined style={{ fontSize: 32, color: '#7b1fa2' }} />,
      color: '#f3e5f5',
      path: '/teacher/profile',
      buttonText: '管理资料',
      buttonType: 'default' as const,
    },
  ];

  const features = [
    {
      icon: <EditOutlined style={{ color: '#1976d2' }} />,
      title: '快速申请',
      description: '通过学号快速查找学生，提交分值修改申请',
    },
    {
      icon: <SearchOutlined style={{ color: '#388e3c' }} />,
      title: '智能查询',
      description: '支持多种方式查询学生信息，筛选功能强大',
    },
    {
      icon: <ClockCircleOutlined style={{ color: '#f57c00' }} />,
      title: '实时状态',
      description: '申请状态实时更新，审核进度一目了然',
    },
    {
      icon: <CheckCircleOutlined style={{ color: '#7b1fa2' }} />,
      title: '审核透明',
      description: '详细的审核记录和反馈，流程公开透明',
    },
  ];

  return (
    <div>
      {/* 欢迎区域 */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          border: 'none',
          marginBottom: 24,
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ color: 'white', textAlign: 'center' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            👨‍🏫 教师工作台
          </Title>
          <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
            日常行为分管理系统
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 16 }}>
            欢迎使用教师工作台！您可以在这里提交学生分值修改申请、查看历史记录、管理学生信息等。
          </Paragraph>
        </div>
      </Card>

      {/* 快速操作卡片 */}
      <Title level={3} style={{ marginBottom: 24 }}>
        快速操作
      </Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: 12,
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: action.color,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  {action.icon}
                </div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {action.title}
                </Title>
                <Text type="secondary" style={{ lineHeight: 1.6 }}>
                  {action.description}
                </Text>
              </div>
              <Button
                type={action.buttonType}
                size="large"
                block
                style={{ marginTop: 20 }}
                onClick={() => navigate(action.path)}
              >
                {action.buttonText}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 功能特色 */}
      <Title level={3} style={{ marginBottom: 24 }}>
        功能特色
      </Title>
      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: '24px 16px' }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>
                {feature.icon}
              </div>
              <Title level={5} style={{ marginBottom: 8 }}>
                {feature.title}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {feature.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: '40px 0' }} />

      {/* 使用提示 */}
      <Card
        title={
          <Space>
            <span style={{ fontSize: 18 }}>💡</span>
            <span>使用提示</span>
          </Space>
        }
        style={{ background: '#fafafa' }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Paragraph>
              <Text strong>1. 提交申请：</Text>
              <br />
              输入学生学号可快速定位学生信息，填写申请原因时请详细说明分值调整的具体情况。
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Paragraph>
              <Text strong>2. 查看记录：</Text>
              <br />
              在申请记录页面可以查看所有提交的申请状态，包括待审核、已通过和已拒绝的申请。
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Paragraph>
              <Text strong>3. 学生查询：</Text>
              <br />
              支持按年级、班级筛选学生，也可以使用关键词搜索特定学生信息。
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Paragraph>
              <Text strong>4. 个人资料：</Text>
              <br />
              定期更新个人信息和密码，确保账户安全。如有问题请联系管理员。
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
