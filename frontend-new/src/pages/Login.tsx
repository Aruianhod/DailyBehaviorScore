import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Divider,
  theme,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state, login } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 如果已经登录，重定向到对应页面
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      switch (state.user.userType) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'teacher':
          navigate('/teacher', { replace: true });
          break;
        case 'student':
          navigate('/student', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [state.isAuthenticated, state.user, navigate]);

  const handleSubmit = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const success = await login(values);
      if (success) {
        // 登录成功后的重定向已经在useEffect中处理
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const userTypeOptions = [
    { value: 'admin', label: '管理员', icon: '👨‍💼' },
    { value: 'teacher', label: '教师', icon: '👨‍🏫' },
    { value: 'student', label: '学生', icon: '👨‍🎓' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Row style={{ width: '100%', maxWidth: 1200 }}>
        <Col xs={24} md={12} lg={14}>
          <div
            style={{
              color: 'white',
              padding: '60px 40px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Title level={1} style={{ color: 'white', marginBottom: 24 }}>
              日常行为分管理系统
            </Title>
            <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
              Student Behavior Score Management System
            </Title>
            <div style={{ marginTop: 40 }}>
              <Space direction="vertical" size="large">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    👨‍💼
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>管理员功能</div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>
                      学生信息导入、分值修改与检查
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    👨‍🏫
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>教师功能</div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>
                      提交分值修改申请及内容管理
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    👨‍🎓
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>学生功能</div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>
                      查询分值及修改记录
                    </div>
                  </div>
                </div>
              </Space>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12} lg={10}>
          <Card
            style={{
              width: '100%',
              maxWidth: 400,
              margin: '0 auto',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
            bodyStyle={{ padding: '40px 32px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <TeamOutlined style={{ fontSize: 48, color: '#1976d2', marginBottom: 16 }} />
              <Title level={3} style={{ margin: 0 }}>
                用户登录
              </Title>
              <Text type="secondary">请选择身份并输入登录信息</Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="userType"
                label="用户类型"
                rules={[{ required: true, message: '请选择用户类型' }]}
              >
                <Select placeholder="请选择用户类型">
                  {userTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <Space>
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{ height: 48, fontSize: 16 }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '24px 0' }} />

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                © 2025 日常行为分管理系统. All rights reserved.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
