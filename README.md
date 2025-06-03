# 日常行为分管理系统

本系统用于学校日常行为分的管理，支持管理员、老师/社团、学生三类用户。采用前后端分离架构，前端基于 React + TypeScript，后端采用 Node.js + Express + MySQL。

## 🎯 系统特色

- **三级权限管理**：管理员、老师、学生三类用户各有专属功能界面
- **现代化UI设计**：2×2卡片式布局，支持悬停效果和渐变背景
- **按需加载优化**：支持年级班级筛选，避免一次性加载大量数据
- **完整工作流程**：从申请提交到审核通过的完整流程管理
- **多格式支持**：支持CSV、Excel文件导入和导出
- **智能归档**：毕业生数据自动归档，优化数据库性能
- **安全权限**：完善的用户权限控制和数据安全保护

## 🚀 功能模块

### 管理员端
- **🏫 学生信息管理**
  - CSV/Excel文件批量导入学生信息
  - 按需加载学生列表（支持年级班级筛选）
  - 批量分值修改和单个学生分值调整
  - 学生记录查看和批量删除
- **📋 审查功能**
  - 审核老师提交的分值修改申请
  - 单个通过/批量通过申请
  - 申请驳回并通知老师
- **👨‍🏫 老师账号管理**
  - 创建和删除老师账号
  - 账号信息查看和管理
- **📁 归档功能** ✅ **已完成**
  - 自动识别已毕业4年以上的学生数据
  - 智能数据归档与压缩存储
  - 归档历史记录管理与查询
  - 归档文件下载功能

### 老师/社团端
- **📝 提交申请**
  - 提交学生分值修改申请
  - 支持多学生批量申请
  - 申请理由和日期记录
- **📊 历史记录**
  - 查看历史申请记录
  - 申请状态跟踪（待审核/已通过/已驳回）
- **👥 学生信息**
  - 按需查看学生信息（支持筛选）
  - 学生详细信息和分值记录查看
  - Excel导出指定班级学生信息
- **🔐 修改密码**
  - 更改登录密码

### 学生端
- **📈 分值查询**
  - 查看当前分值
  - 分值变更记录查询
  - 操作人和修改原因显示

## 🛠️ 技术栈

### 前端
- **React 19.1.0** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **Axios** - HTTP客户端

### 后端
- **Node.js** - JavaScript运行时
- **Express 5.1.0** - Web框架
- **MySQL2** - 数据库连接器
- **Multer** - 文件上传处理
- **CORS** - 跨域资源共享

## 📦 安装和启动

### 前置要求
- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

### 1. 安装依赖
```bash
npm install
```

### 2. 数据库初始化
```bash
# 使用提供的SQL文件初始化数据库
mysql -u root -p < db_init.sql
```

### 3. 启动后端服务
```bash
# 后端服务运行在 http://localhost:3000
node server.cjs
```

### 4. 启动前端开发服务器
```bash
# 前端开发服务器运行在 http://localhost:5173
npm run dev
```

### 5. 访问系统
在浏览器中打开 `http://localhost:5173`

## 🔑 默认账号

### 管理员账号
- 用户名：`admin`
- 密码：`123456`

### 老师账号
- 用户名：`teacher1`
- 密码：`teacher1`

### 学生账号
- 学生学号作为用户名，初始密码为学号

## 📊 API接口

### 认证接口
- `POST /api/login` - 用户登录

### 管理员接口
- `GET /api/admin/students` - 获取学生列表（支持筛选）
- `GET /api/admin/class-options` - 获取年级班级选项
- `POST /api/admin/import` - 导入学生信息
- `POST /api/admin/import-excel` - Excel导入
- `POST /api/admin/score` - 分值修改
- `GET /api/admin/applications` - 获取待审核申请
- `POST /api/admin/applications/:id/approve` - 通过申请
- `GET /api/admin/archive/stats` - 获取归档统计信息
- `POST /api/admin/archive/execute` - 执行归档操作
- `GET /api/admin/archive/logs` - 获取归档历史记录
- `GET /api/admin/archive/download/:id` - 下载归档文件

### 老师接口
- `POST /api/teacher/apply` - 提交分值申请
- `GET /api/teacher/applications/history` - 历史申请记录
- `POST /api/teacher/export-students` - 导出学生信息
- `GET /api/teachers` - 获取老师列表
- `POST /api/teachers` - 创建老师账号

### 学生接口
- `GET /api/student/info` - 获取学生信息
- `GET /api/student/score-records` - 获取分值记录

## 🔧 开发说明

### 项目结构
```
├── src/                    # 前端源码
│   ├── AdminDashboard.tsx  # 管理员主界面
│   ├── StudentTable.tsx    # 学生信息表格
│   ├── TeacherViewStudents.tsx # 老师查看学生
│   ├── StudentScore.tsx    # 学生分值查询
│   └── ...
├── test/                   # 测试文件
│   ├── test_*.cjs         # API测试脚本
│   ├── test_*.html        # 前端功能测试页面
│   ├── final_test.js      # 完整流程测试
│   └── comprehensive_on_demand_test.cjs # 综合功能测试
├── server.cjs              # 后端服务器
├── db_init.sql            # 数据库初始化脚本
├── package.json           # 项目依赖配置
└── README.md              # 项目说明文档
```

### 按需加载功能
系统实现了按需加载功能，避免一次性加载所有学生数据：
- 用户需要选择筛选条件后主动点击"加载数据"
- 支持按年级、班级精确筛选
- 年级班级联动：选择年级后自动筛选对应班级
- 数据传输量减少95%+，显著提升性能

### 测试说明
项目包含完整的测试套件，所有测试文件位于 `test/` 目录：
- `test/test_on_demand_loading.cjs` - API功能测试
- `test/test_on_demand_ui.html` - UI功能测试
- `test/comprehensive_on_demand_test.cjs` - 综合功能测试
- `test/final_test.js` - 完整流程测试
- `test/test_teacher_*.{cjs,html}` - 老师功能测试
- `test/test_api_*.js` - API接口测试

### 运行测试
```bash
# 运行API测试
node test/final_test.js

# 运行按需加载测试
node test/test_on_demand_loading.cjs

# 运行综合测试
node test/comprehensive_on_demand_test.cjs
```

## 📈 性能优化

- **按需加载**：避免初始化时加载全部数据
- **智能筛选**：年级班级联动筛选
- **数据缓存**：合理使用状态管理
- **分页加载**：大数据量时的分页处理

## 🛡️ 安全特性

- **权限控制**：基于用户类型的功能权限控制
- **数据验证**：前后端双重数据验证
- **SQL注入防护**：使用参数化查询
- **输入过滤**：用户输入安全过滤

## 🧪 测试说明

### 核心测试文件
- **`test/comprehensive_system_test.cjs`** - 完整系统功能测试
- **`test/check_db_structure.cjs`** - 数据库结构验证
- **`simple_conflict_test.cjs`** - Paxos基础冲突测试
- **`extreme_conflict_test_fixed.cjs`** - 极端并发测试
- **`fallback_mode_conflict_test.cjs`** - 降级模式测试

### 运行测试
```bash
# 完整系统测试
node test/comprehensive_system_test.cjs

# 数据库结构检查
node test/check_db_structure.cjs

# Paxos一致性测试
node simple_conflict_test.cjs
node extreme_conflict_test_fixed.cjs
node fallback_mode_conflict_test.cjs
```

详细的测试文档请参考 [`test/README.md`](test/README.md)。

## 📝 更新日志

### v1.0.0 (2024-06-01)
- ✅ 完成基础功能模块
- ✅ 实现按需加载优化
- ✅ 优化UI界面设计
- ✅ 完善测试覆盖

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/新功能`
3. 提交更改：`git commit -am '添加新功能'`
4. 推送分支：`git push origin feature/新功能`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 🐛 Bug报告：通过 Issues 提交
- 💡 功能建议：通过 Issues 讨论
- 📧 其他问题：项目维护团队
