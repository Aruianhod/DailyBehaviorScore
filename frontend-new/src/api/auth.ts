import { apiRequest } from './client';
import { 
  LoginRequest, 
  LoginResponse, 
  ChangePasswordRequest, 
  ApiResponse 
} from '../types';

export const authApi = {
  // 用户登录
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest.post('/auth/login', credentials);
  },

  // 用户登出
  logout: (): Promise<ApiResponse> => {
    return apiRequest.post('/auth/logout');
  },

  // 刷新Token
  refreshToken: (): Promise<ApiResponse<{ token: string; expiresAt: string }>> => {
    return apiRequest.post('/auth/refresh');
  },

  // 修改密码
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse> => {
    return apiRequest.put('/auth/change-password', data);
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse> => {
    return apiRequest.get('/auth/me');
  },

  // 验证Token
  verifyToken: (): Promise<ApiResponse> => {
    return apiRequest.get('/auth/verify');
  },
};
