@echo off
REM GitHub推送脚本
echo 🚀 开始推送到GitHub...
echo.

cd /d "%~dp0"

echo 📊 检查当前git状态...
git status
echo.

echo 📤 推送到GitHub远程仓库...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ 推送成功！
    echo 📍 查看远程仓库: https://github.com/Aruianhod/DailyBehaviorScore
) else (
    echo.
    echo ❌ 推送失败，可能的原因：
    echo   - 网络连接问题
    echo   - GitHub访问受限
    echo   - 认证问题
    echo.
    echo 💡 解决建议：
    echo   1. 检查网络连接
    echo   2. 稍后重试
    echo   3. 使用VPN或代理
)

echo.
echo 📝 本地提交已完成，代码已保存在本地仓库
pause
