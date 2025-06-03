@echo off
chcp 65001 >nul

echo 🚀 推送简化版本到GitHub
echo ========================

echo 📋 当前分支: paxos-enhancement-and-testing
echo 📋 最新提交: 简化测试脚本和项目结构清理

echo.
echo 🔄 尝试推送到GitHub...

git push origin paxos-enhancement-and-testing

if errorlevel 1 (
    echo.
    echo ❌ 推送失败，可能的原因:
    echo    - 网络连接问题
    echo    - GitHub服务不可用
    echo    - 需要检查网络设置
    echo.
    echo 💡 解决方案:
    echo    1. 检查网络连接
    echo    2. 稍后重试
    echo    3. 或手动在VS Code中推送
    echo.
    pause
) else (
    echo.
    echo ✅ 推送成功！
    echo 🌐 GitHub仓库已更新
    echo.
    pause
)
