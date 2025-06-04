import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  theme,
  Button,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TrophyOutlined,
  HistoryOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content } = Layout;
const { Title } = Typography;

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = [
    {
      key: '/student',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: '/student/score',
      icon: <TrophyOutlined />,
      label: '我的分数',
    },
    {
      key: '/student/records',
      icon: <HistoryOutlined />,
      label: '分数记录',
    },
  ];
  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
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
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header
        style={{
          padding: '0 24px',
          background: colorBgContainer,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Space>
          <Title level={4} style={{ margin: 0, color: '#1976d2' }}>
            📚 学生平时分查询系统
          </Title>
        </Space>
        
        <Space size="large">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ 
              border: 'none',
              background: 'transparent',
              minWidth: 300,
            }}
          />
          
          <Space>
            <span style={{ color: '#666' }}>
              {state.user?.name || '同学'}，你好！
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
        </Space>
      </Header>
      
      <Content
        style={{
          margin: '24px',
          padding: 24,
          minHeight: 'calc(100vh - 112px)',
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}        >
        {children}
      </Content>
    </Layout>
  );
};

export default StudentLayout;
