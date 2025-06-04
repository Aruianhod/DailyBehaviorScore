import { apiRequest } from './client';
import { 
  Student, 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams, 
  FilterParams 
} from '../types';

export const studentApi = {
  // 获取学生列表（分页）
  getStudents: (params: PaginationParams & FilterParams): Promise<ApiResponse<PaginatedResponse<Student>>> => {
    return apiRequest.get('/students', { params });
  },

  // 获取单个学生信息
  getStudent: (id: string): Promise<ApiResponse<Student>> => {
    return apiRequest.get(`/students/${id}`);
  },

  // 根据学号获取学生信息
  getStudentByStudentId: (studentId: string): Promise<ApiResponse<Student>> => {
    return apiRequest.get(`/students/by-student-id/${studentId}`);
  },

  // 创建学生
  createStudent: (student: Omit<Student, 'id'>): Promise<ApiResponse<Student>> => {
    return apiRequest.post('/students', student);
  },

  // 更新学生信息
  updateStudent: (id: string, student: Partial<Student>): Promise<ApiResponse<Student>> => {
    return apiRequest.put(`/students/${id}`, student);
  },

  // 删除学生
  deleteStudent: (id: string): Promise<ApiResponse> => {
    return apiRequest.delete(`/students/${id}`);
  },

  // 批量删除学生
  deleteStudents: (ids: string[]): Promise<ApiResponse> => {
    return apiRequest.post('/students/batch-delete', { ids });
  },

  // 批量导入学生
  importStudents: (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest.upload('/students/import', formData);
  },

  // 导出学生数据
  exportStudents: (params?: FilterParams): Promise<void> => {
    return apiRequest.download('/students/export', 'students.xlsx', { params });
  },

  // 更新学生分数
  updateStudentScore: (id: string, score: number, reason?: string): Promise<ApiResponse> => {
    return apiRequest.put(`/students/${id}/score`, { score, reason });
  },

  // 获取学生分数历史记录
  getStudentScoreHistory: (id: string): Promise<ApiResponse> => {
    return apiRequest.get(`/students/${id}/score-history`);
  },

  // 搜索学生
  searchStudents: (keyword: string): Promise<ApiResponse<Student[]>> => {
    return apiRequest.get('/students/search', { params: { keyword } });
  },

  // 获取年级列表
  getGrades: (): Promise<ApiResponse<string[]>> => {
    return apiRequest.get('/students/grades');
  },

  // 获取班级列表
  getClasses: (grade?: string): Promise<ApiResponse<string[]>> => {
    return apiRequest.get('/students/classes', { params: { grade } });
  },
};
