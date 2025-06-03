@echo off
chcp 65001 >nul

echo.
echo ==========================================
echo           Paxos一致性检测测试菜单
echo ==========================================
echo.

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 需要Node.js环境
    pause
    exit /b 1
)

REM 检查服务是否运行
echo 🔍 检查服务状态...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ 后端服务未运行，请先启动: quick_start.bat
    pause
    exit /b 1
)

echo ✅ 后端服务正常
echo.

:menu
echo 请选择要执行的测试:
echo.
echo 1. 快速功能验证 (基础检查)
echo 2. 完整测试套件 (全面测试)
echo 3. 并发冲突模拟 (压力测试)
echo 4. 高级Paxos测试 (深度验证)
echo 5. Paxos服务直接测试 (服务层测试)
echo 6. 创建测试老师账户
echo 7. 运行所有测试
echo 8. 退出
echo.
set /p choice=请输入选项 (1-8): 

if "%choice%"=="1" goto quick_test
if "%choice%"=="2" goto full_test
if "%choice%"=="3" goto conflict_test
if "%choice%"=="4" goto advanced_test
if "%choice%"=="5" goto direct_test
if "%choice%"=="6" goto create_teachers
if "%choice%"=="7" goto all_tests
if "%choice%"=="8" goto exit
echo 无效选项，请重新选择
pause
goto menu

:quick_test
echo.
echo 🚀 执行快速功能验证...
echo ========================
node quick_paxos_validation.cjs
goto end

:full_test
echo.
echo 🧪 执行完整测试套件...
echo ======================
node test_paxos_consistency.cjs
goto end

:conflict_test
echo.
echo ⚡ 执行并发冲突模拟...
echo ====================
node simulate_conflicts.cjs
goto end

:advanced_test
echo.
echo 🔬 执行高级Paxos测试...
echo =======================
node advanced_paxos_test.cjs
goto end

:direct_test
echo.
echo 🎯 执行Paxos服务直接测试...
echo ===========================
node paxos_service_direct_test.cjs
goto end

:create_teachers
echo.
echo 👥 创建测试老师账户...
echo ====================
node create_test_teachers.cjs
goto end

:all_tests
echo.
echo 🎯 执行所有测试...
echo ================
echo.
echo === 1/5 快速功能验证 ===
node quick_paxos_validation.cjs
echo.
echo === 2/5 完整测试套件 ===
node test_paxos_consistency.cjs
echo.
echo === 3/5 并发冲突模拟 ===
node simulate_conflicts.cjs
echo.
echo === 4/5 高级Paxos测试 ===
node advanced_paxos_test.cjs
echo.
echo === 5/5 Paxos服务直接测试 ===
node paxos_service_direct_test.cjs
echo.
echo ✅ 所有测试完成！
goto end

:exit
echo.
echo 👋 退出测试菜单
goto end

:end
echo.
echo 按任意键返回菜单或关闭...
pause >nul
if "%choice%"=="8" exit /b 0
goto menu
