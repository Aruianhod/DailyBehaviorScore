import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  theme,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  HistoryOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = [
    {
      key: '/teacher',
      icon: <DashboardOutlined />,
      label: '工作台',
    },
    {
      key: '/teacher/apply',
      icon: <FileTextOutlined />,
      label: '提交申请',
    },
    {
      key: '/teacher/history',
      icon: <HistoryOutlined />,
      label: '申请记录',
    },
    {
      key: '/teacher/students',
      icon: <TeamOutlined />,
      label: '学生信息',
    },
    {
      key: '/teacher/profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/teacher/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 8,
        }}>
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#1976d2' }}>
              教师工作台
            </Title>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              日常行为分管理系统
            </Title>
          </Space>
          
          <Space>
            <span style={{ color: '#666' }}>
              欢迎，{state.user?.name || '老师'}
            </span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button
                type="text"
                style={{
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Avatar icon={<UserOutlined />} />
              </Button>
            </Dropdown>
          </Space>
        </Header>
        
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
