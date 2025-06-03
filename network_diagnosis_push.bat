@echo off
REM 网络诊断和GitHub推送脚本
echo 🔍 GitHub推送网络诊断工具
echo ==============================
echo.

cd /d "%~dp0"

echo 📊 Git配置检查:
echo 远程仓库URL:
git remote get-url origin
echo.

echo 🌐 网络连接测试:
echo 测试DNS解析...
nslookup github.com
echo.

echo 测试GitHub连接...
ping github.com -n 2
echo.

echo 📋 当前分支状态:
git branch --show-current
echo.

echo 📝 待推送的提交:
git log --oneline -3
echo.

echo 🚀 尝试推送到GitHub...
echo ==============================

REM 方法1: 标准推送
echo 方法1: 标准推送
git push -u origin paxos-enhancement-and-testing
set push_result=%ERRORLEVEL%

if %push_result% equ 0 (
    echo ✅ 推送成功！
    goto success
)

echo ❌ 标准推送失败，尝试方法2...
echo.

REM 方法2: 使用不同的协议
echo 方法2: 尝试不同的推送选项
git push -u origin paxos-enhancement-and-testing --verbose
set push_result2=%ERRORLEVEL%

if %push_result2% equ 0 (
    echo ✅ 推送成功！
    goto success
)

echo ❌ 推送仍然失败
echo.
echo 🔧 网络问题诊断:
echo   - 可能是防火墙阻止了443端口
echo   - 可能需要使用VPN或代理
echo   - GitHub服务可能暂时不可用
echo.
echo 💡 建议解决方案:
echo   1. 检查网络设置和防火墙
echo   2. 稍后重试（网络可能恢复）
echo   3. 使用GitHub Desktop等图形工具
echo   4. 联系网络管理员
goto end

:success
echo.
echo 🎉 推送成功完成！
echo 📍 新分支地址: https://github.com/Aruianhod/DailyBehaviorScore/tree/paxos-enhancement-and-testing
echo 📋 创建PR: https://github.com/Aruianhod/DailyBehaviorScore/compare/paxos-enhancement-and-testing
echo.
echo 📝 推送摘要:
echo   - 分支: paxos-enhancement-and-testing
echo   - 提交数: 2个新提交
echo   - 包含: Paxos改进 + 测试优化

:end
echo.
echo 按任意键退出...
pause > nul
