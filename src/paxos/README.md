# Paxos一致性检测服务

这是一个完全独立的Paxos协议实现，专门为行为分管理系统提供分布式一致性检测。该服务可以独立运行，不依赖主服务器。

## 🚀 快速开始

### 1. 安装依赖

确保您已安装Node.js (版本 >= 14.0.0)，然后安装所需依赖：

```bash
npm install express cors axios
```

### 2. 启动服务

#### Windows用户
```cmd
start_paxos.bat
```

#### Linux/macOS用户
```bash
chmod +x start_paxos.sh
./start_paxos.sh
```

#### 或者直接使用Node.js
```bash
node startPaxosService.js
```

### 3. 验证服务

```bash
node testPaxosService.js
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
# 使用默认设置启动
node startPaxosService.js

# 指定端口和节点ID
node startPaxosService.js --port 3003 --node-id admin_node_1

# 指定多个节点
node startPaxosService.js --nodes admin_node_1,admin_node_2,backup_node
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
const { PaxosClient } = require('./PaxosClient');

const client = new PaxosClient('http://localhost:3002');

// 检查分值修改一致性
const result = await client.checkScoreChangeConsistency({
  studentIds: ['2025000001'],
  delta: -5,
  reason: '迟到扣分',
  operator: 'teacher1'
});

if (result.success && result.data.result.allowed) {
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

1. **PaxosNode.ts** - Paxos协议核心实现
2. **PaxosManager.ts** - Paxos网络管理器
3. **PaxosService.js** - Express服务器
4. **PaxosClient.js** - 客户端SDK
5. **config.js** - 配置管理

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
node startPaxosService.js --log-level debug
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

如有问题或建议，请查看日志输出或运行测试脚本进行诊断。