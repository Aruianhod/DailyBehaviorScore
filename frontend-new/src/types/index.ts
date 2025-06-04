// 用户类型定义
export interface User {
  id: string;
  username: string;
  userType: 'admin' | 'teacher' | 'student';
  name?: string;
  email?: string;
}

// 学生信息类型
export interface Student {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  class: string;
  score: number;
  email?: string;
  phone?: string;
}

// 分值修改申请类型
export interface ScoreApplication {
  id: string;
  applicationNumber?: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  applicantName?: string;
  currentScore: number;
  requestedScore: number;
  scoreChange?: number;
  reason: string;
  type?: string;
  evidence?: string;
  occurredAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  reviewReason?: string;
}

// 申请状态枚举
export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// 分值修改记录类型
export interface ScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  previousScore: number;
  newScore: number;
  changeReason: string;
  changedBy: string;
  changedAt: string;
  operationType: 'manual' | 'application';
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
  userType: 'admin' | 'teacher' | 'student';
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

// 修改密码请求类型
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 筛选参数类型
export interface FilterParams {
  grade?: string;
  class?: string;
  keyword?: string;
  status?: string;
  dateRange?: [string, string];
}
