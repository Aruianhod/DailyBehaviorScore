#!/bin/bash

# 日常行为分管理系统 - 快速启动脚本
# 一键启动所有服务：Paxos + 后端 + 前端

echo "🚀 快速启动 - 日常行为分管理系统"
echo "==============================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要安装Node.js"
    exit 1
fi

echo "🔧 正在启动所有服务..."
echo ""

# 启动Paxos服务（后台）
echo "📡 启动Paxos分布式服务..."
cd src/paxos
nohup node startSimplePaxos.cjs > paxos.log 2>&1 &
PAXOS_PID=$!
cd ../..

# 等待Paxos启动
sleep 3

# 启动后端服务（后台）
echo "🖥️  启动后端服务器..."
nohup node server.cjs > server.log 2>&1 &
SERVER_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务（前台）
echo "🌐 启动前端开发服务器..."
echo ""
echo "✅ 系统启动完成！"
echo "📋 服务地址:"
echo "  🔗 Paxos:   http://localhost:3002"
echo "  🖥️  后端:   http://localhost:3000"
echo "  🌐 前端:   http://localhost:5173"
echo ""
echo "💡 按 Ctrl+C 停止所有服务"
echo ""

# 设置信号处理，优雅关闭所有服务
cleanup() {
    echo ""
    echo "🛑 正在关闭所有服务..."
    kill $PAXOS_PID 2>/dev/null
    kill $SERVER_PID 2>/dev/null
    echo "✅ 所有服务已关闭"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 启动前端（前台运行）
npm run dev
