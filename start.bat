@echo off
chcp 65001 >nul

REM 日常行为分管理系统 - 快速启动脚本
REM 一键启动所有服务：Paxos + 后端 + 前端

echo 🚀 快速启动 - 日常行为分管理系统
echo ================================

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 需要安装Node.js
    pause
    exit /b 1
)

echo 🔧 正在启动所有服务...
echo.

REM 启动Paxos服务（后台）
echo 📡 启动Paxos分布式服务...
cd src\paxos
start /min "Paxos" cmd /c "node startSimplePaxos.cjs"
cd ..\..

REM 等待Paxos启动
timeout /t 3 /nobreak >nul

REM 启动后端服务（后台）
echo 🖥️  启动后端服务器...
start /min "Backend" cmd /c "node server.cjs"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端服务（前台）
echo 🌐 启动前端开发服务器...
echo.
echo ✅ 系统启动完成！打开浏览器访问: http://localhost:5173
echo 💡 关闭此窗口将停止前端服务，后台服务将继续运行
echo.

npm run dev
