#!/bin/bash

# 日常行为分管理系统 - 一键启动脚本 (Linux/macOS)
# 同时启动Paxos分布式服务和主服务器

echo "🚀 日常行为分管理系统 - 一键启动"
echo "========================================"

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装npm，请先安装npm"
    exit 1
fi

# 检查必要文件
if [ ! -f "server.cjs" ]; then
    echo "❌ 错误: 缺少主服务器文件 server.cjs"
    exit 1
fi

if [ ! -f "src/paxos/PaxosService.cjs" ]; then
    echo "❌ 错误: 缺少Paxos服务文件"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ 错误: 缺少package.json文件"
    exit 1
fi

echo "✅ 环境检查完成"
echo ""

# 函数：检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# 函数：等待端口可用
wait_for_port() {
    local port=$1
    local service_name=$2
    local timeout=30
    local count=0
    
    echo "⏳ 等待 $service_name 在端口 $port 启动..."
    while [ $count -lt $timeout ]; do
        if check_port $port; then
            echo "✅ $service_name 启动成功"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    echo "⚠️  $service_name 启动超时"
    return 1
}

# 启动菜单函数
show_menu() {
    echo ""
    echo "请选择启动模式:"
    echo "1) 完整启动 (Paxos + 后端 + 前端)"
    echo "2) 仅启动后端服务 (后端 + 前端)"
    echo "3) 独立启动Paxos服务"
    echo "4) 独立启动后端服务"
    echo "5) 独立启动前端服务"
    echo "6) 查看服务状态"
    echo "7) 停止所有服务"
    echo "8) 退出"
    echo ""
    read -p "请输入选择 (1-8): " choice
}

# 检查服务状态函数
check_services() {
    echo ""
    echo "🔍 检查服务状态"
    echo "==============="
    
    echo "检查端口使用情况:"
    echo ""
    
    # 检查Paxos端口
    echo "Paxos服务端口 (3002-3011):"
    for port in {3002..3011}; do
        if check_port $port; then
            echo "  ✅ 端口 $port: 正在使用"
        fi
    done
    
    # 检查后端端口
    echo ""
    echo "后端服务端口 (3000):"
    if check_port 3000; then
        echo "  ✅ 端口 3000: 正在使用"
    else
        echo "  ❌ 端口 3000: 未使用"
    fi
    
    # 检查前端端口
    echo ""
    echo "前端服务端口 (5173):"
    if check_port 5173; then
        echo "  ✅ 端口 5173: 正在使用"
    else
        echo "  ❌ 端口 5173: 未使用"
    fi
    
    echo ""
    echo "测试服务连通性:"
    echo ""
    
    # 测试Paxos服务
    echo "🧪 测试Paxos服务..."
    if curl -s http://localhost:3002/health >/dev/null 2>&1; then
        echo "  ✅ Paxos服务正常"
    else
        echo "  ❌ Paxos服务不可达"
    fi
    
    # 测试后端服务
    echo "🧪 测试后端服务..."
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "  ✅ 后端服务正常"
    else
        echo "  ❌ 后端服务不可达"
    fi
    
    # 测试前端服务
    echo "🧪 测试前端服务..."
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo "  ✅ 前端服务正常"
    else
        echo "  ❌ 前端服务不可达"
    fi
    
    echo ""
}

# 停止所有服务函数
stop_all_services() {
    echo ""
    echo "🛑 停止所有服务"
    echo "==============="
    
    # 停止Paxos服务
    echo "停止Paxos服务..."
    for port in {3002..3011}; do
        pid=$(lsof -t -i:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            kill $pid 2>/dev/null
            echo "  ✅ 停止端口 $port 上的进程"
        fi
    done
    
    # 停止后端服务
    echo "停止后端服务..."
    pid=$(lsof -t -i:3000 2>/dev/null)
    if [ ! -z "$pid" ]; then
        kill $pid 2>/dev/null
        echo "  ✅ 停止后端服务"
    fi
    
    # 停止前端服务
    echo "停止前端服务..."
    pid=$(lsof -t -i:5173 2>/dev/null)
    if [ ! -z "$pid" ]; then
        kill $pid 2>/dev/null
        echo "  ✅ 停止前端服务"
    fi
    
    # 停止Node.js进程
    echo "清理Node.js进程..."
    pkill -f "node.*server.cjs" 2>/dev/null
    pkill -f "node.*startSimplePaxos.cjs" 2>/dev/null
    pkill -f "npm.*run.*dev" 2>/dev/null
    
    echo "✅ 所有服务已停止"
}

# 完整启动函数
full_startup() {
    echo ""
    echo "🌟 完整启动模式"
    echo "================"
    
    # 启动Paxos服务
    echo "📡 步骤 1/3: 启动Paxos分布式服务..."
    cd src/paxos
    nohup node startSimplePaxos.cjs > paxos.log 2>&1 &
    cd ../..
    
    sleep 3
    
    # 启动后端服务
    echo "🖥️  步骤 2/3: 启动后端服务器..."
    nohup node server.cjs > server.log 2>&1 &
    
    wait_for_port 3000 "后端服务"
    
    # 启动前端服务
    echo "🌐 步骤 3/3: 启动前端开发服务器..."
    nohup npm run dev > frontend.log 2>&1 &
    
    wait_for_port 5173 "前端服务"
    
    echo ""
    echo "✅ 所有服务启动完成！"
    echo ""
    echo "📋 服务信息:"
    echo "  🔗 Paxos服务:     http://localhost:3002 (或自动切换端口)"
    echo "  🖥️  后端服务:     http://localhost:3000"
    echo "  🌐 前端服务:     http://localhost:5173"
    echo ""
    echo "📄 日志文件:"
    echo "  📡 Paxos日志:     src/paxos/paxos.log"
    echo "  🖥️  后端日志:     server.log"
    echo "  🌐 前端日志:     frontend.log"
    echo ""
    echo "💡 提示:"
    echo "  - 可以使用浏览器访问 http://localhost:5173"
    echo "  - 使用 tail -f *.log 查看实时日志"
    echo "  - 使用选项7停止所有服务"
}

# 后端启动函数
backend_only() {
    echo ""
    echo "🎯 后端服务启动模式"
    echo "=================="
    
    # 启动后端服务
    echo "🖥️  启动后端服务器..."
    nohup node server.cjs > server.log 2>&1 &
    
    wait_for_port 3000 "后端服务"
    
    # 启动前端服务
    echo "🌐 启动前端开发服务器..."
    nohup npm run dev > frontend.log 2>&1 &
    
    wait_for_port 5173 "前端服务"
    
    echo ""
    echo "✅ 后端和前端服务启动完成！"
    echo ""
    echo "📋 服务信息:"
    echo "  🖥️  后端服务:     http://localhost:3000"
    echo "  🌐 前端服务:     http://localhost:5173"
    echo ""
    echo "💡 提示: Paxos服务未启动，系统将使用降级模式"
}

# 主循环
while true; do
    show_menu
    
    case $choice in
        1)
            full_startup
            ;;
        2)
            backend_only
            ;;
        3)
            echo ""
            echo "📡 独立启动Paxos服务"
            echo "==================="
            cd src/paxos
            node startSimplePaxos.cjs
            cd ../..
            ;;
        4)
            echo ""
            echo "🖥️  独立启动后端服务"
            echo "=================="
            node server.cjs
            ;;
        5)
            echo ""
            echo "🌐 独立启动前端服务"
            echo "=================="
            npm run dev
            ;;
        6)
            check_services
            ;;
        7)
            stop_all_services
            ;;
        8)
            echo ""
            echo "👋 退出启动脚本"
            exit 0
            ;;
        *)
            echo "❌ 无效选择，请重新输入"
            ;;
    esac
    
    if [ "$choice" != "6" ] && [ "$choice" != "7" ]; then
        echo ""
        read -p "按回车键返回菜单..."
    fi
done
