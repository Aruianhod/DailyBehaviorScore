# 测试文件说明

本目录包含了日常行为分管理系统的核心测试文件。

## 🧪 测试文件列表

### 核心系统测试
- **`comprehensive_system_test.cjs`** - 🎯 **主要测试文件**
  - 完整的系统功能测试
  - 涵盖所有用户角色（管理员、老师、学生）
  - 包含权限控制、数据完整性、文件操作等测试
  - 生成详细的测试报告
  - 用于验证系统的整体功能正常性

### 数据库相关测试
- **`check_db_structure.cjs`** - 📊 数据库结构检查
  - 验证数据库表结构的完整性
  - 检查索引、约束等数据库配置
  - 用于部署前的数据库验证

## 🔧 Paxos分布式一致性测试

### 根目录下的Paxos测试文件：
- **`simple_conflict_test.cjs`** - 🎯 基础冲突检测测试
  - 测试Paxos一致性协议的基本功能
  - 验证冲突检测机制
  - 适用于日常开发测试

- **`extreme_conflict_test_fixed.cjs`** - ⚡ 极端并发测试
  - 高强度并发冲突测试
  - 验证系统在极端负载下的表现
  - 用于压力测试和性能验证

- **`fallback_mode_conflict_test.cjs`** - 🛡️ 降级模式测试
  - 测试Paxos服务不可用时的降级行为
  - 验证系统的安全性和可用性
  - 确保关键操作在降级模式下被正确拒绝

## 🚀 运行测试

### 1. 运行完整系统测试
```bash
node test/comprehensive_system_test.cjs
```

### 2. 检查数据库结构
```bash
node test/check_db_structure.cjs
```

### 3. 运行Paxos一致性测试
```bash
# 基础测试
node simple_conflict_test.cjs

# 极端并发测试
node extreme_conflict_test_fixed.cjs

# 降级模式测试
node fallback_mode_conflict_test.cjs
```

## 📝 测试报告

- 完整系统测试会生成JSON格式的测试报告
- 报告包含每个测试项的执行时间和结果
- 测试报告保存在 `test/` 目录下，文件名格式：`test_report_YYYY-MM-DD_HH-mm-ss.json`

## ⚠️ 注意事项

1. **运行前确保**：
   - MySQL数据库服务正在运行
   - 主服务器（server.cjs）已启动
   - 根据需要启动或停止Paxos服务

2. **测试环境**：
   - 测试会使用真实的数据库连接
   - 某些测试可能会修改数据，建议在测试环境运行

3. **Paxos测试**：
   - Paxos相关测试需要根据具体场景启动相应服务
   - 降级模式测试需要确保Paxos服务未运行

## 🎯 测试策略

- **开发阶段**：主要使用 `comprehensive_system_test.cjs` 进行功能验证
- **部署前**：运行所有测试文件确保系统完整性
- **生产监控**：定期运行基础测试验证系统健康状态
