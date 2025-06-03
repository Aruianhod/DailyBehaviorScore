# Paxos一致性检测服务

这是一个完全独立的Paxos协议实现，专门为行为分管理系统提供分布式一致性检测。该服务可以独立运行，不依赖主服务器。

## 🚀 快速开始

### 1. 安装依赖

确保您已安装Node.js (版本 >= 14.0.0)，然后安装所需依赖：

```bash
npm install express cors axios
```

### 2. 启动服务

#### 推荐方式 - 使用简单启动脚本
```bash
node startSimplePaxos.cjs
```

#### Windows用户
```cmd
start_paxos_enhanced.bat
```

#### Linux/macOS用户
```bash
chmod +x start_paxos_enhanced.sh
./start_paxos_enhanced.sh
```

### 3. 验证服务

启动服务后，可以通过以下方式验证：

```bash
# 健康检查
curl http://localhost:3002/health

# 端口测试
node quick_port_test.cjs
```

## 📋 服务配置

### 命令行参数

- `--port` / `-p`: 服务端口 (默认: 3002)
- `--node-id` / `-n`: 节点ID (默认: 自动生成)
- `--log-level` / `-l`: 日志级别 (默认: info)
- `--nodes`: 节点列表，逗号分隔
- `--help` / `-h`: 显示帮助信息

### 示例
```bash
# 使用默认设置启动（推荐方式）
node startSimplePaxos.cjs

# 使用增强启动脚本
start_paxos_enhanced.bat  # Windows
./start_paxos_enhanced.sh # Linux/macOS

# 端口测试
node quick_port_test.cjs
```

## 🔧 API接口

### 1. 健康检查
```http
GET /health
```

### 2. 初始化网络
```http
POST /initialize
Content-Type: application/json

{
  "nodeIds": ["node1", "node2", "node3"]
}
```

### 3. 分值修改一致性检查
```http
POST /consistency/score-change
Content-Type: application/json

{
  "studentIds": ["2025000001", "2025000002"],
  "delta": -10,
  "reason": "违纪扣分",
  "operator": "admin"
}
```

### 4. 申请审核一致性检查
```http
POST /consistency/application-review
Content-Type: application/json

{
  "applicationId": "12345",
  "action": "approve",
  "reviewer": "admin",
  "reason": "审核通过"
}
```

### 5. 归档操作一致性检查
```http
POST /consistency/archive
Content-Type: application/json

{
  "grades": ["2020", "2021"],
  "reason": "学期结束归档",
  "operator": "admin"
}
```

### 6. 获取系统状态
```http
GET /status
```

### 7. 强制同步
```http
POST /sync
```

## 🔍 使用示例

### JavaScript客户端
```javascript
// 通过主服务器的Paxos集成模块使用
const axios = require('axios');

// 检查分值修改一致性
const result = await axios.post('http://localhost:3002/consistency/score-change', {
  studentIds: ['2025000001'],
  delta: -5,
  reason: '迟到扣分',
  operator: 'teacher1'
});

if (result.data.success && result.data.result.allowed) {
  console.log('操作允许执行');
} else {
  console.log('操作被阻止:', result.data.result.conflicts);
}
```

### cURL示例
```bash
# 健康检查
curl http://localhost:3002/health

# 分值修改检查
curl -X POST http://localhost:3002/consistency/score-change \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": ["2025000001"],
    "delta": -5,
    "reason": "测试",
    "operator": "admin"
  }'
```

## 🏗️ 架构说明

### 核心组件

1. **DistributedConsistencyService.cjs** - 分布式一致性服务核心
2. **PaxosManager.cjs** - Paxos协议管理器
3. **PaxosService.cjs** - Express HTTP服务器
4. **PaxosIntegration.cjs** - 主服务器集成模块
5. **startSimplePaxos.cjs** - 简单启动脚本
6. **utils/portUtils.cjs** - 端口工具模块

### 一致性检测流程

1. **接收请求** - 客户端发送一致性检查请求
2. **冲突检测** - 检查是否存在并发操作冲突
3. **Paxos共识** - 通过Paxos算法在节点间达成共识
4. **返回结果** - 返回是否允许操作及相关建议

### 冲突类型

- **分值修改冲突**: 同一学生的并发分值修改
- **审核冲突**: 同一申请的重复审核
- **归档冲突**: 并发归档操作或归档期间的其他操作

## 📊 监控与调试

### 日志输出
服务启动后会输出详细的日志信息，包括：
- 节点状态变化
- 共识过程
- 冲突检测结果
- 性能指标

### 状态监控
通过 `/status` 接口可以获取：
- 节点健康状态
- 共识统计
- 错误计数
- 运行时间

### 性能指标
- 平均共识时间
- 成功率
- 吞吐量
- 错误率

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```
   Error: listen EADDRINUSE: address already in use :::3002
   ```
   解决方案: 使用 `--port` 参数指定其他端口

2. **节点无法通信**
   ```
   节点间通信失败
   ```
   解决方案: 检查防火墙设置和网络连接

3. **共识超时**
   ```
   Consensus timeout
   ```
   解决方案: 检查节点数量和网络延迟

### 调试模式
```bash
# 启动简单Paxos服务进行调试
node startSimplePaxos.cjs

# 端口连通性测试
node quick_port_test.cjs

# 查看服务状态
curl http://localhost:3002/health
```

## 🔒 安全考虑

- 目前版本为开发环境设计，生产环境需要添加认证机制
- 建议在内网环境中使用
- 定期监控系统状态和日志

## 📈 性能优化

### 配置调优
- 根据网络延迟调整超时时间
- 根据负载调整节点数量
- 优化心跳间隔

### 监控指标
- 共识延迟
- 网络分区检测
- 内存和CPU使用率

## 🔮 扩展功能

- 持久化存储
- 集群自动发现
- 动态节点添加/移除
- 负载均衡
- 灾难恢复

## 📞 支持

### 最新更新 (2025年6月3日)
本版本已经过重大清理优化：
- 移除了重复和过时的文件
- 保留了核心功能组件
- 简化了启动流程
- 提供了更稳定的服务

### 当前文件结构
```
src/paxos/
├── DistributedConsistencyService.cjs  # 分布式一致性服务核心
├── PaxosIntegration.cjs              # 主服务器集成模块
├── PaxosManager.cjs                  # Paxos协议管理器
├── PaxosService.cjs                  # HTTP服务器
├── startSimplePaxos.cjs              # 主要启动脚本
├── quick_port_test.cjs               # 端口测试工具
├── start_paxos_enhanced.bat          # Windows增强启动脚本
├── start_paxos_enhanced.sh           # Linux/macOS增强启动脚本
├── README.md                         # 本说明文档
└── utils/
    └── portUtils.cjs                 # 端口工具模块
```

如有问题或建议，请查看日志输出或运行健康检查进行诊断。