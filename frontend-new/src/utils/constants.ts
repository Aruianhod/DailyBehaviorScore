// 应用配置常量

// API 配置
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
} as const;

// 表格配置
export const TABLE_CONFIG = {
  SCROLL_Y: 400,
  ROW_KEY: 'id',
  SIZE: 'middle',
} as const;

// 表单配置
export const FORM_CONFIG = {
  LAYOUT: 'vertical',
  LABEL_COL: { span: 6 },
  WRAPPER_COL: { span: 18 },
} as const;

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ],
  ACCEPT: '.xlsx,.xls,.csv',
} as const;

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

// 申请状态
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// 申请状态文本映射
export const APPLICATION_STATUS_TEXT = {
  [APPLICATION_STATUS.PENDING]: '待审核',
  [APPLICATION_STATUS.APPROVED]: '已通过',
  [APPLICATION_STATUS.REJECTED]: '已拒绝',
} as const;

// 申请状态颜色映射
export const APPLICATION_STATUS_COLOR = {
  [APPLICATION_STATUS.PENDING]: 'orange',
  [APPLICATION_STATUS.APPROVED]: 'green',
  [APPLICATION_STATUS.REJECTED]: 'red',
} as const;

// 操作类型
export const OPERATION_TYPE = {
  MANUAL: 'manual',
  APPLICATION: 'application',
} as const;

// 操作类型文本映射
export const OPERATION_TYPE_TEXT = {
  [OPERATION_TYPE.MANUAL]: '手动修改',
  [OPERATION_TYPE.APPLICATION]: '申请审核',
} as const;

// 日期格式
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY',
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  TOKEN_EXPIRE: 'tokenExpire',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
} as const;

// 主题色彩
export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
} as const;

// 响应式断点
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: 300,
  EASE: 'ease-in-out',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '没有权限访问该资源',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器内部错误',
  VALIDATION_ERROR: '输入数据格式不正确',
  FILE_TOO_LARGE: '文件大小超出限制',
  FILE_TYPE_NOT_ALLOWED: '不支持的文件类型',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '已退出登录',
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
  UPLOAD_SUCCESS: '上传成功',
  COPY_SUCCESS: '已复制到剪贴板',
} as const;

// 确认消息
export const CONFIRM_MESSAGES = {
  DELETE_CONFIRM: '确定要删除吗？此操作无法撤销。',
  LOGOUT_CONFIRM: '确定要退出登录吗？',
  SAVE_CONFIRM: '确定要保存当前修改吗？',
  CANCEL_CONFIRM: '确定要取消吗？未保存的修改将丢失。',
} as const;

// 默认头像
export const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IiNCREJEQkQiLz4KPHBhdGggZD0iTTEwIDUyQzEwIDQyLjA1ODkgMTguMDU4OSAzNCAyOCAzNEgzNkM0NS45NDExIDM0IDU0IDQyLjA1ODkgNTQgNTJWNTJIMTBWNTJaIiBmaWxsPSIjQkRCREJEIi8+Cjwvc3ZnPgo=';

// 正则表达式
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  STUDENT_ID: /^\d{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  CHINESE_NAME: /^[\u4e00-\u9fa5]{2,10}$/,
} as const;

// 申请类型
export const APPLICATION_TYPES = {
  SCORE_INCREASE: 'score_increase',
  SCORE_DECREASE: 'score_decrease',
  SCORE_CORRECTION: 'score_correction',
} as const;
