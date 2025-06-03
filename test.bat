@echo off
chcp 65001 >nul

REM 日常行为分管理系统 - 测试执行脚本
REM 通过输入数字选择执行不同的测试文件

:menu
cls
echo  日常行为分管理系统 - 测试菜单
echo ================================
echo.
echo  核心系统测试:
echo    1. 综合系统测试 (comprehensive_system_test.cjs)
echo    2. 简单冲突测试 (simple_conflict_test.cjs)
echo    3. 极限冲突测试 (extreme_conflict_test_fixed.cjs)
echo    4. 降级模式测试 (fallback_mode_conflict_test.cjs)
echo    5. 清理测试报告
echo.
echo    0. 退出
echo.
set /p choice="请选择要执行的测试 (0-5): "

if "%choice%"=="0" goto :exit
if "%choice%"=="1" goto :test1
if "%choice%"=="2" goto :test2
if "%choice%"=="3" goto :test3
if "%choice%"=="4" goto :test4
if "%choice%"=="5" goto :cleanup
goto :invalid

:test1
echo.
echo 🧪 执行综合系统测试...
echo ==================
cd test
node comprehensive_system_test.cjs
cd ..
goto :continue

:test2
echo.
echo 🧪 执行简单冲突测试...
echo ==================
cd test
node simple_conflict_test.cjs
cd ..
goto :continue

:test3
echo.
echo 🧪 执行极限冲突测试...
echo ==================
cd test
node extreme_conflict_test_fixed.cjs
cd ..
goto :continue

:test4
echo.
echo 🧪 执行降级模式测试...
echo ==================
cd test
node fallback_mode_conflict_test.cjs
cd ..
goto :continue

:cleanup
echo.
echo 🧹 清理测试报告...
echo ==================
if exist test\test_report_*.json (
    del /q test\test_report_*.json
    echo ✅ 测试报告已清理
) else (
    echo ℹ️  没有找到测试报告文件
)
if exist test_*.log (
    del /q test_*.log
    echo ✅ 测试日志已清理
)
echo 清理完成！
goto :continue

:invalid
echo.
echo ❌ 无效选择，请输入 0-5 之间的数字
goto :continue

:continue
echo.
echo 按任意键返回菜单...
pause >nul
goto :menu

:exit
echo.
echo 👋 感谢使用测试脚本！
echo.
