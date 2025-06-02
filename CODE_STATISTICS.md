# 日常行为分管理系统 - 代码统计报告

## 📊 代码行数统计 (排除测试文件和自动生成文件)

### 🎯 前端代码 (TypeScript + React)

#### 📱 主要组件文件 (.tsx)
- AdminDashboard.tsx: 404 行
- AdminImport.tsx: 104 行  
- AdminReview.tsx: 409 行
- App.tsx: 460 行
- ArchiveManagement.tsx: 609 行
- ArchiveViewer.tsx: 408 行
- Login.tsx: 218 行
- main.tsx: 10 行
- MobileStudentScore.tsx: 400 行
- SimpleArchiveTest.tsx: 81 行
- StudentScore.tsx: 155 行
- StudentTable.tsx: 606 行
- TeacherApply.tsx: 167 行
- TeacherChangePassword.tsx: 238 行
- TeacherHistory.tsx: 183 行
- TeacherManagement.tsx: 304 行
- TeacherNotifications.tsx: 41 行
- TeacherViewStudents.tsx: 540 行
- TestAdminDashboard.tsx: 79 行

**小计: 19 个文件，5,416 行**

#### 🧩 通用组件 (.tsx)
- AlertDialog.tsx: 139 行
- ConfirmDialog.tsx: 159 行
- InputDialog.tsx: 210 行
- Modal.tsx: 100 行

**小计: 4 个文件，608 行**

#### 🪝 Hooks 和工具 (.ts)
- useDeviceDetection.ts: 89 行
- useDialog.ts: 92 行

**小计: 2 个文件，181 行**

#### 🎨 样式文件 (.css)
- App.css: 130 行
- index.css: 80 行

**小计: 2 个文件，210 行**

### 🖥️ 后端代码 (Node.js + Express)
- server.cjs: 1,331 行

**小计: 1 个文件，1,331 行**

### 🗃️ 数据库代码 (MySQL)
- db_init.sql: 80 行

**小计: 1 个文件，80 行**

### 📄 HTML 模板
- index.html: 13 行

**小计: 1 个文件，13 行**

---

## 🎯 总体统计

| 类型 | 文件数 | 代码行数 | 占比 |
|------|--------|----------|------|
| 前端组件 (TSX) | 23 | 6,024 | 74.0% |
| 后端服务 (CJS) | 1 | 1,331 | 16.4% |
| 前端工具/Hooks (TS) | 2 | 181 | 2.2% |
| 样式文件 (CSS) | 2 | 210 | 2.6% |
| 数据库 (SQL) | 1 | 80 | 1.0% |
| HTML 模板 | 1 | 13 | 0.2% |

### 📈 **总计: 30 个文件，8,139 行代码**

---

## 🏗️ 系统架构概览

### 前端 (React + TypeScript) - 6,415 行
- **管理员端**: 学生管理、分值修改、归档管理、审核功能
- **老师/社团端**: 分值申请、历史查询、密码管理
- **学生端**: 分值查询、记录查看 (包含移动端优化)
- **通用组件**: 对话框、模态框等复用组件
- **设备检测**: 移动端适配和响应式设计

### 后端 (Node.js + Express + MySQL) - 1,331 行
- **用户认证**: 登录验证、权限控制
- **数据管理**: 学生信息CRUD、分值记录管理
- **归档功能**: 学生数据归档、文件导出
- **审核流程**: 分值申请审核、通知系统
- **文件处理**: Excel导入、数据导出

### 数据库 (MySQL) - 80 行
- **用户表**: 统一身份认证
- **学生表**: 学生信息和分值
- **记录表**: 分值变动历史
- **申请表**: 分值修改申请
- **归档表**: 归档操作日志

---

## 🎉 项目特点

✅ **前后端分离架构**  
✅ **三端用户体系** (管理员/老师/学生)  
✅ **移动端适配优化**  
✅ **完整的审核流程**  
✅ **数据归档管理**  
✅ **权限控制系统**  
✅ **响应式设计**

---

*统计时间: 2025年6月2日*  
*排除文件: 测试文件、配置文件、node_modules等自动生成内容*
