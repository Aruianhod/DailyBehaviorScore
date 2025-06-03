# 一键启动脚本使用说明

本项目提供了四个启动脚本，用于快速启动日常行为分管理系统的所有服务（Paxos分布式服务 + 后端服务器 + 前端开发服务器）。

## 📜 脚本文件

### Windows脚本
- `quick_start.bat` - 快速启动（推荐）
- `start_all_services.bat` - 完整启动菜单

### Linux/macOS脚本  
- `quick_start.sh` - 快速启动（推荐）
- `start_all_services.sh` - 完整启动菜单

## 🚀 使用方法

### Windows用户

#### 方式1: 双击运行
直接双击 `quick_start.bat` 文件即可启动所有服务。

#### 方式2: 命令行运行
```cmd
# 快速启动
quick_start.bat

# 或使用完整菜单
start_all_services.bat
```

### Linux/macOS用户

#### 首次使用需要添加执行权限
```bash
chmod +x quick_start.sh
chmod +x start_all_services.sh
```

#### 运行脚本
```bash
# 快速启动
./quick_start.sh

# 或使用完整菜单
./start_all_services.sh
```

## 🎯 启动模式说明

### 快速启动 (quick_start)
- 自动启动Paxos服务（后台）
- 自动启动后端服务器（后台）
- 启动前端开发服务器（前台）
- 适合日常开发使用

### 完整启动菜单 (start_all_services)
提供以下选项：
1. **完整启动** - Paxos + 后端 + 前端
2. **仅后端启动** - 后端 + 前端（不启动Paxos）
3. **独立启动Paxos服务**
4. **独立启动后端服务**
5. **独立启动前端服务**
6. **查看服务状态**
7. **停止所有服务**（仅Linux/macOS）

## 🌐 服务地址

启动成功后，可以通过以下地址访问：

- **前端界面**: http://localhost:5173
- **后端API**: http://localhost:3000
- **Paxos服务**: http://localhost:3002 (或自动切换到其他端口)

## 🔧 技术特性

### 智能端口管理
- Paxos服务支持自动端口切换（3002-3011）
- 如果默认端口被占用，会自动尝试下一个端口

### 降级模式
- 如果Paxos服务不可用，系统会自动使用降级模式
- 后端服务仍可正常运行，只是没有分布式一致性检查

### 优雅关闭
- Linux/macOS版本支持Ctrl+C优雅关闭所有服务
- Windows版本可通过关闭窗口停止相应服务

## 🛠️ 故障排除

### 端口被占用
如果遇到端口被占用的问题：

**Windows:**
```cmd
# 查看端口占用情况
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3002"
netstat -ano | findstr ":5173"

# 结束占用进程（替换PID为实际进程ID）
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
# 查看端口占用
lsof -i :3000
lsof -i :3002
lsof -i :5173

# 结束占用进程
kill -9 <PID>
```

### 服务启动失败
1. 确保已安装Node.js和npm
2. 确保已运行 `npm install` 安装依赖
3. 检查数据库是否已正确配置和启动
4. 查看错误日志（Linux/macOS用户可查看.log文件）

### 依赖问题
```bash
# 重新安装依赖
npm install

# 检查Node.js版本（建议14.0.0以上）
node --version
npm --version
```

## 📚 相关文档

- [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) - 详细启动指南
- [src/paxos/README.md](./src/paxos/README.md) - Paxos服务说明
- [PAXOS_SYSTEM_GUIDE.md](./PAXOS_SYSTEM_GUIDE.md) - Paxos系统详解

## 💡 使用建议

1. **日常开发**: 使用 `quick_start` 脚本快速启动
2. **功能测试**: 使用完整菜单按需启动指定服务
3. **生产部署**: 建议分别部署各服务并配置进程管理器
4. **调试问题**: 使用独立启动模式逐个检查服务状态
