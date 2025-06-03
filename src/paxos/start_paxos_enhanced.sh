#!/bin/bash

# Paxos分布式一致性检测服务启动脚本
# 支持端口自动切换功能

echo "🚀 启动Paxos分布式一致性检测服务"
echo "======================================"

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js，请先安装Node.js"
    exit 1
fi

# 切换到paxos目录
cd "$(dirname "$0")"

echo "📂 当前目录: $(pwd)"

# 检查必要文件
required_files=("PaxosService.cjs" "PaxosIntegration.cjs" "startSimplePaxos.cjs")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误: 缺少必要文件 $file"
        exit 1
    fi
done

echo "✅ 文件检查完成"

# 启动选项菜单
echo ""
echo "请选择启动模式:"
echo "1) 启动单个Paxos服务 (适用于开发测试)"
echo "2) 启动多个Paxos服务 (演示端口自动切换)"
echo "3) 运行完整验证测试"
echo "4) 退出"

read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔧 启动单个Paxos服务..."
        echo "默认端口: 3002 (如果被占用会自动切换)"
        node startSimplePaxos.cjs
        ;;
    2)
        echo ""
        echo "🔧 启动多个Paxos服务以演示端口自动切换..."
        echo "这将启动3个服务，展示端口自动切换功能"
        
        # 启动第一个服务
        echo "启动服务1..."
        node -e "
            const { PaxosService } = require('./PaxosService.cjs');
            (async () => {
                const service = new PaxosService({ nodeId: 'service_1', port: 3002, portSearchRange: 10 });
                await service.start();
                const info = service.getPortInfo();
                console.log('服务1启动完成 - 端口:', info.actual);
                // 保持运行
                process.on('SIGINT', async () => {
                    await service.shutdown();
                    process.exit(0);
                });
            })();
        " &
        
        sleep 2
        
        # 启动第二个服务
        echo "启动服务2..."
        node -e "
            const { PaxosService } = require('./PaxosService.cjs');
            (async () => {
                const service = new PaxosService({ nodeId: 'service_2', port: 3002, portSearchRange: 10 });
                await service.start();
                const info = service.getPortInfo();
                console.log('服务2启动完成 - 端口:', info.actual, info.switched ? '(已切换)' : '(默认)');
                // 保持运行
                process.on('SIGINT', async () => {
                    await service.shutdown();
                    process.exit(0);
                });
            })();
        " &
        
        sleep 2
        
        # 启动第三个服务
        echo "启动服务3..."
        node -e "
            const { PaxosService } = require('./PaxosService.cjs');
            (async () => {
                const service = new PaxosService({ nodeId: 'service_3', port: 3002, portSearchRange: 10 });
                await service.start();
                const info = service.getPortInfo();
                console.log('服务3启动完成 - 端口:', info.actual, info.switched ? '(已切换)' : '(默认)');
                // 保持运行
                process.on('SIGINT', async () => {
                    await service.shutdown();
                    process.exit(0);
                });
            })();
        " &
        
        echo ""
        echo "✅ 多个服务启动完成！"
        echo "💡 提示: 按 Ctrl+C 停止所有服务"
        
        # 等待用户中断
        wait
        ;;
    3)
        echo ""
        echo "🧪 运行完整验证测试..."
        node testFinalValidation.cjs
        ;;
    4)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
