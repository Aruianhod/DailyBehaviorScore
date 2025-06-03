@echo off
chcp 65001 >nul

REM 日常行为分管理系统 - 一键启动脚本 (Windows)
REM 同时启动Paxos分布式服务和主服务器

echo 🚀 日常行为分管理系统 - 一键启动
echo ========================================

REM 检查Node.js环境
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未安装Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查必要文件
if not exist "server.cjs" (
    echo ❌ 错误: 缺少主服务器文件 server.cjs
    pause
    exit /b 1
)

if not exist "src\paxos\PaxosService.cjs" (
    echo ❌ 错误: 缺少Paxos服务文件
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ 错误: 缺少package.json文件
    pause
    exit /b 1
)

echo ✅ 环境检查完成

echo.
echo 🔧 正在启动服务...
echo.

REM 创建启动菜单
:start_menu
echo 请选择启动模式:
echo 1) 完整启动 (Paxos + 后端 + 前端)
echo 2) 仅启动后端服务 (后端 + 前端)
echo 3) 独立启动Paxos服务
echo 4) 独立启动后端服务
echo 5) 独立启动前端服务
echo 6) 查看服务状态
echo 7) 退出

set /p choice="请输入选择 (1-7): "

if "%choice%"=="1" goto full_startup
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto paxos_only
if "%choice%"=="4" goto server_only
if "%choice%"=="5" goto frontend_only
if "%choice%"=="6" goto check_status
if "%choice%"=="7" goto exit_script
goto invalid_choice

:full_startup
echo.
echo 🌟 完整启动模式
echo ================

echo 📡 步骤 1/3: 启动Paxos分布式服务...
cd src\paxos
start "Paxos Service" cmd /k "echo 启动Paxos服务... && node startSimplePaxos.cjs"
cd ..\..

echo ⏳ 等待Paxos服务启动...
timeout /t 3 /nobreak >nul

echo 🖥️  步骤 2/3: 启动后端服务器...
start "Backend Server" cmd /k "echo 启动后端服务器... && node server.cjs"

echo ⏳ 等待后端服务启动...
timeout /t 3 /nobreak >nul

echo 🌐 步骤 3/3: 启动前端开发服务器...
start "Frontend Dev Server" cmd /k "echo 启动前端开发服务器... && npm run dev"

echo.
echo ✅ 所有服务启动完成！
echo.
echo 📋 服务信息:
echo   🔗 Paxos服务:     http://localhost:3002 (或自动切换端口)
echo   🖥️  后端服务:     http://localhost:3000
echo   🌐 前端服务:     http://localhost:5173
echo.
echo 💡 提示:
echo   - 系统将自动打开浏览器访问前端
echo   - 如需停止服务，关闭对应的命令行窗口
echo   - Paxos服务会自动处理端口冲突
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173
goto end

:backend_only
echo.
echo 🎯 后端服务启动模式
echo ==================

echo 🖥️  启动后端服务器...
start "Backend Server" cmd /k "echo 启动后端服务器... && node server.cjs"

echo ⏳ 等待后端服务启动...
timeout /t 3 /nobreak >nul

echo 🌐 启动前端开发服务器...
start "Frontend Dev Server" cmd /k "echo 启动前端开发服务器... && npm run dev"

echo.
echo ✅ 后端和前端服务启动完成！
echo.
echo 📋 服务信息:
echo   🖥️  后端服务:     http://localhost:3000
echo   🌐 前端服务:     http://localhost:5173
echo.
echo 💡 提示: Paxos服务未启动，系统将使用降级模式
timeout /t 2 /nobreak >nul
start http://localhost:5173
goto end

:paxos_only
echo.
echo 📡 独立启动Paxos服务
echo ===================

cd src\paxos
echo 🔧 启动Paxos分布式一致性服务...
node startSimplePaxos.cjs
cd ..\..
goto end

:server_only
echo.
echo 🖥️  独立启动后端服务
echo ==================

echo 🔧 启动后端服务器...
node server.cjs
goto end

:frontend_only
echo.
echo 🌐 独立启动前端服务
echo ==================

echo 🔧 启动前端开发服务器...
npm run dev
goto end

:check_status
echo.
echo 🔍 检查服务状态
echo ===============

echo 检查端口使用情况:
echo.
echo Paxos服务端口 (3002-3011):
netstat -an | findstr ":300" | findstr "LISTENING"
echo.
echo 后端服务端口 (3000):
netstat -an | findstr ":3000" | findstr "LISTENING"
echo.
echo 前端服务端口 (5173):
netstat -an | findstr ":5173" | findstr "LISTENING"
echo.

echo 测试服务连通性:
echo.
echo 🧪 测试Paxos服务...
curl -s http://localhost:3002/health >nul 2>&1
if errorlevel 1 (
    echo   ❌ Paxos服务不可达
) else (
    echo   ✅ Paxos服务正常
)

echo 🧪 测试后端服务...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo   ❌ 后端服务不可达
) else (
    echo   ✅ 后端服务正常
)

echo 🧪 测试前端服务...
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    echo   ❌ 前端服务不可达
) else (
    echo   ✅ 前端服务正常
)

echo.
pause
goto start_menu

:invalid_choice
echo ❌ 无效选择，请重新输入
echo.
goto start_menu

:exit_script
echo.
echo 👋 退出启动脚本
goto end

:end
echo.
echo 脚本执行完成
pause
