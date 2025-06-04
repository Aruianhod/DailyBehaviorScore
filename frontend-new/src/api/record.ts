import { apiRequest } from './client';
import { 
  ScoreRecord, 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams, 
  FilterParams 
} from '../types';

export const recordApi = {
  // 获取分值修改记录列表（分页）
  getRecords: (params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<ScoreRecord>>> => {
    return apiRequest.get('/records', { params });
  },

  // 获取单个记录详情
  getRecord: (id: string): Promise<ApiResponse<ScoreRecord>> => {
    return apiRequest.get(`/records/${id}`);
  },

  // 获取学生的分值修改记录
  getStudentRecords: (studentId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ScoreRecord>>> => {
    return apiRequest.get(`/records/student/${studentId}`, { params });
  },

  // 获取教师的操作记录
  getTeacherRecords: (teacherId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ScoreRecord>>> => {
    return apiRequest.get(`/records/teacher/${teacherId}`, { params });
  },

  // 创建分值修改记录（手动操作）
  createRecord: (record: {
    studentId: string;
    previousScore: number;
    newScore: number;
    changeReason: string;
  }): Promise<ApiResponse<ScoreRecord>> => {
    return apiRequest.post('/records', record);
  },

  // 获取记录统计数据
  getRecordStats: (params?: FilterParams): Promise<ApiResponse<{
    totalRecords: number;
    totalStudents: number;
    avgScoreChange: number;
    operationTypes: { [key: string]: number };
  }>> => {
    return apiRequest.get('/records/stats', { params });
  },

  // 导出记录数据
  exportRecords: (params?: FilterParams): Promise<void> => {
    return apiRequest.download('/records/export', 'score-records.xlsx', { params });
  },

  // 删除记录（仅管理员）
  deleteRecord: (id: string): Promise<ApiResponse> => {
    return apiRequest.delete(`/records/${id}`);
  },

  // 批量删除记录
  deleteRecords: (ids: string[]): Promise<ApiResponse> => {
    return apiRequest.post('/records/batch-delete', { ids });
  },
};
