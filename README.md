# 日常行为分管理系统

本系统用于学校日常行为分的管理，支持管理员、老师/社团、学生三类用户，前后端分离，前端基于 React + TypeScript，后端将采用 Node.js + Express + MySQL。

## 功能模块
- **管理员端**：学生信息导入、分值修改与检查。
- **老师/社团端**：提交分值修改及内容申请。
- **学生端**：查询分值及修改记录。

### 启动前端
```bash
npm install
npm run dev
```

#### 后端与数据库
后端与数据库将在后续步骤补充。

##### 访问方式
在内网环境下，用户可通过浏览器访问前端页面。

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
