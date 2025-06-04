import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, LoginRequest, LoginResponse } from '../types';
import { authApi } from '../api/auth';
import { message } from 'antd';

// 认证状态类型
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 认证操作类型
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

// 认证上下文类型
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuthStatus: () => void;
}

// 初始状态
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

// 状态减速器
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 登录函数
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        const { user, token, expiresAt } = response.data as LoginResponse;
        
        // 保存到本地存储
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tokenExpire', expiresAt);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        
        message.success('登录成功');
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
        message.error(response.message || '登录失败');
        return false;
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      message.error('网络错误，请重试');
      console.error('Login error:', error);
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpire');
    
    dispatch({ type: 'LOGOUT' });
    message.success('已退出登录');
  };

  // 更新用户信息
  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // 检查认证状态
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const expireTime = localStorage.getItem('tokenExpire');

    if (token && userStr && expireTime) {
      const currentTime = new Date().getTime();
      const expireTimeMs = new Date(expireTime).getTime();

      if (currentTime < expireTimeMs) {
        try {
          const user = JSON.parse(userStr);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          console.error('Parse user data error:', error);
          logout();
        }
      } else {
        // Token 过期
        logout();
      }
    }
  };

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    state,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 使用认证上下文的 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
