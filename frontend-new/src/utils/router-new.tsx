import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 导入页面组件
import LoginPage from '../pages/Login';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';

// 管理员页面
import AdminDashboard from '../pages/admin/Dashboard';
import StudentManagement from '../pages/admin/StudentManagement';
import ApplicationReview from '../pages/admin/ApplicationReview';

// 教师页面
import TeacherDashboard from '../pages/teacher/Dashboard';
import ScoreApplication from '../pages/teacher/ScoreApplication';
import ApplicationHistory from '../pages/teacher/ApplicationHistory';

// 学生页面
import StudentDashboard from '../pages/student/Dashboard';
import ScoreHistory from '../pages/student/ScoreHistory';

// 权限路由组件
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(state.user.userType)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// 未授权页面
const UnauthorizedPage: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    gap: 16
  }}>
    <h1>403 - 访问被拒绝</h1>
    <p>您没有权限访问此页面</p>
    <button onClick={() => window.history.back()}>返回上一页</button>
  </div>
);

// 404页面
const NotFoundPage: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    gap: 16
  }}>
    <h1>404 - 页面未找到</h1>
    <p>您访问的页面不存在</p>
    <button onClick={() => window.location.href = '/'}>返回首页</button>
  </div>
);

// 根据用户类型重定向
const RootRedirect: React.FC = () => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (state.user.userType) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// 管理员子路由组件
const AdminRoutes: React.FC = () => (
  <Routes>
    <Route index element={<AdminDashboard />} />
    <Route path="students" element={<StudentManagement />} />
    <Route path="applications" element={<ApplicationReview />} />
  </Routes>
);

// 教师子路由组件
const TeacherRoutes: React.FC = () => (
  <Routes>
    <Route index element={<TeacherDashboard />} />
    <Route path="apply" element={<ScoreApplication />} />
    <Route path="history" element={<ApplicationHistory />} />
  </Routes>
);

// 学生子路由组件
const StudentRoutes: React.FC = () => (
  <Routes>
    <Route index element={<StudentDashboard />} />
    <Route path="history" element={<ScoreHistory />} />
  </Routes>
);

// 主路由组件
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* 管理员路由 */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminRoutes />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      
      {/* 教师路由 */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLayout>
              <TeacherRoutes />
            </TeacherLayout>
          </ProtectedRoute>
        }
      />
      
      {/* 学生路由 */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout>
              <StudentRoutes />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
