import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './utils/router';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';

// 设置 dayjs 本地化
dayjs.locale('zh-cn');

// Ant Design 主题配置
const theme = {
  token: {
    colorPrimary: '#1976d2',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Menu: {
      itemSelectedBg: '#e3f2fd',
      itemSelectedColor: '#1976d2',
    },
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
