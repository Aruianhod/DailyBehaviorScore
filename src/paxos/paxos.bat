@echo off
chcp 65001 >nul

REM Paxos分布式一致性检测服务启动脚本 (Windows)
REM 支持端口自动切换功能

echo 🚀 启动Paxos分布式一致性检测服务
echo ======================================

REM 检查Node.js环境
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未安装Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 切换到脚本所在目录
cd /d "%~dp0"

echo 📂 当前目录: %cd%

REM 检查必要文件
if not exist "PaxosService.cjs" (
    echo ❌ 错误: 缺少必要文件 PaxosService.cjs
    pause
    exit /b 1
)

if not exist "PaxosIntegration.cjs" (
    echo ❌ 错误: 缺少必要文件 PaxosIntegration.cjs
    pause
    exit /b 1
)

if not exist "startSimplePaxos.cjs" (
    echo ❌ 错误: 缺少必要文件 startSimplePaxos.cjs
    pause
    exit /b 1
)

echo ✅ 文件检查完成

echo.
echo 请选择启动模式:
echo 1) 启动单个Paxos服务 (适用于开发测试)
echo 2) 启动多个Paxos服务 (演示端口自动切换)
echo 3) 运行完整验证测试
echo 4) 查看端口使用情况
echo 5) 退出

set /p choice="请输入选择 (1-5): "

if "%choice%"=="1" goto single_service
if "%choice%"=="2" goto multiple_services
if "%choice%"=="3" goto validation_test
if "%choice%"=="4" goto port_status
if "%choice%"=="5" goto exit_script
goto invalid_choice

:single_service
echo.
echo 🔧 启动单个Paxos服务...
echo 默认端口: 3002 (如果被占用会自动切换)
node startSimplePaxos.cjs
goto end

:multiple_services
echo.
echo 🔧 启动多个Paxos服务以演示端口自动切换...
echo 这将启动3个服务，展示端口自动切换功能
echo.
echo 💡 提示: 按 Ctrl+C 停止服务
echo.

REM 创建临时的多服务启动脚本
echo const { PaxosService } = require('./PaxosService.cjs'); > temp_multi_start.cjs
echo. >> temp_multi_start.cjs
echo async function startMultipleServices() { >> temp_multi_start.cjs
echo   const services = []; >> temp_multi_start.cjs
echo   for (let i = 1; i ^<= 3; i++) { >> temp_multi_start.cjs
echo     const service = new PaxosService({ >> temp_multi_start.cjs
echo       nodeId: `service_${i}`, >> temp_multi_start.cjs
echo       port: 3002, >> temp_multi_start.cjs
echo       portSearchRange: 10 >> temp_multi_start.cjs
echo     }); >> temp_multi_start.cjs
echo     await service.start(); >> temp_multi_start.cjs
echo     services.push(service); >> temp_multi_start.cjs
echo     const info = service.getPortInfo(); >> temp_multi_start.cjs
echo     console.log(`服务${i}启动完成 - 端口: ${info.actual} ${info.switched ? '(已切换)' : '(默认)'}`); >> temp_multi_start.cjs
echo   } >> temp_multi_start.cjs
echo   process.on('SIGINT', async () =^> { >> temp_multi_start.cjs
echo     for (const service of services) { >> temp_multi_start.cjs
echo       await service.shutdown(); >> temp_multi_start.cjs
echo     } >> temp_multi_start.cjs
echo     process.exit(0); >> temp_multi_start.cjs
echo   }); >> temp_multi_start.cjs
echo } >> temp_multi_start.cjs
echo. >> temp_multi_start.cjs
echo startMultipleServices().catch(console.error); >> temp_multi_start.cjs

node temp_multi_start.cjs
del temp_multi_start.cjs
goto end

:validation_test
echo.
echo 🧪 运行完整验证测试...
node testFinalValidation.cjs
goto end

:port_status
echo.
echo 🔍 检查端口使用情况...
echo 常用端口范围 3000-3010:
netstat -an | findstr ":300"
echo.
echo 💡 如果看到 :3002、:3003 等端口显示 LISTENING 状态，说明端口被占用
goto menu

:invalid_choice
echo ❌ 无效选择
goto menu

:exit_script
echo 👋 退出
goto end

:menu
echo.
pause
goto start

:end
pause
