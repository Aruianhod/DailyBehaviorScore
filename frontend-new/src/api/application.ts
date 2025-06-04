import { apiRequest } from './client';
import { 
  ScoreApplication, 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams, 
  FilterParams 
} from '../types';

export const applicationApi = {
  // 获取申请列表（分页）
  getApplications: (params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<ScoreApplication>>> => {
    return apiRequest.get('/applications', { params });
  },

  // 获取单个申请详情
  getApplication: (id: string): Promise<ApiResponse<ScoreApplication>> => {
    return apiRequest.get(`/applications/${id}`);
  },

  // 创建分值修改申请
  createApplication: (application: {
    studentId: string;
    requestedScore: number;
    reason: string;
  }): Promise<ApiResponse<ScoreApplication>> => {
    return apiRequest.post('/applications', application);
  },

  // 更新申请
  updateApplication: (id: string, application: Partial<ScoreApplication>): Promise<ApiResponse<ScoreApplication>> => {
    return apiRequest.put(`/applications/${id}`, application);
  },

  // 删除申请
  deleteApplication: (id: string): Promise<ApiResponse> => {
    return apiRequest.delete(`/applications/${id}`);
  },

  // 审核申请（管理员）
  reviewApplication: (id: string, action: 'approve' | 'reject', comment?: string): Promise<ApiResponse> => {
    return apiRequest.post(`/applications/${id}/review`, { action, comment });
  },

  // 批量审核申请
  batchReviewApplications: (ids: string[], action: 'approve' | 'reject', comment?: string): Promise<ApiResponse> => {
    return apiRequest.post('/applications/batch-review', { ids, action, comment });
  },

  // 获取教师的申请历史
  getTeacherApplications: (params?: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<ScoreApplication>>> => {
    return apiRequest.get('/applications/teacher', { params });
  },

  // 获取申请统计数据
  getApplicationStats: (): Promise<ApiResponse<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>> => {
    return apiRequest.get('/applications/stats');
  },

  // 撤销申请（教师）
  withdrawApplication: (id: string): Promise<ApiResponse> => {
    return apiRequest.post(`/applications/${id}/withdraw`);
  },

  // 导出申请数据
  exportApplications: (params?: FilterParams): Promise<void> => {
    return apiRequest.download('/applications/export', 'applications.xlsx', { params });
  },
};
