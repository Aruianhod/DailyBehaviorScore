@echo off
REM GitHub推送脚本 - 使用个人访问令牌
echo 🚀 使用令牌推送到GitHub新分支...
echo.

cd /d "%~dp0"

echo 📊 当前Git状态:
git status --short
echo.

echo 🌿 当前分支信息:
git branch --show-current
echo.

echo 📤 推送到GitHub远程仓库...
REM 使用令牌进行认证推送
git push -u origin paxos-enhancement-and-testing

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ 推送成功！
    echo 📍 新分支已创建: paxos-enhancement-and-testing
    echo 🔗 查看分支: https://github.com/Aruianhod/DailyBehaviorScore/tree/paxos-enhancement-and-testing
    echo 📋 可以创建Pull Request: https://github.com/Aruianhod/DailyBehaviorScore/compare/paxos-enhancement-and-testing
) else (
    echo.
    echo ❌ 推送失败，尝试备用方法...
    echo.
    echo 🔄 尝试强制推送...
    git push --force-with-lease origin paxos-enhancement-and-testing
    
    if %ERRORLEVEL% equ 0 (
        echo ✅ 强制推送成功！
    ) else (
        echo ❌ 推送仍然失败
        echo.
        echo 💡 可能的解决方案：
        echo   1. 检查网络连接
        echo   2. 验证令牌权限
        echo   3. 稍后重试
    )
)

echo.
echo 📝 本地分支状态:
git log --oneline -3
pause
