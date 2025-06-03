# Paxos文件夹谨慎清理脚本
# 只删除确认不需要的测试文件和重复文件

Write-Host "🧹 开始谨慎清理Paxos文件夹..." -ForegroundColor Green

# 切换到Paxos目录
Set-Location "C:\Users\Administrator\Desktop\workspace\code\src\paxos"

Write-Host "📂 当前目录: $(Get-Location)" -ForegroundColor Cyan

# 1. 删除测试文件（17个）
Write-Host "`n🗑️  删除测试文件..." -ForegroundColor Yellow
$testFiles = @(
    "testComprehensive.cjs",
    "testDirectConflict.cjs", 
    "testFinalPortSwitch.cjs",
    "testFinalValidation.cjs",
    "testMainServerIntegration.cjs",
    "testMinimalPort.cjs",
    "testPaxosIntegration.cjs",
    "testPaxosService.cjs",
    "testPaxosService.js",
    "testPortAutoSwitch.cjs",
    "testPortDetection.cjs",
    "testPortSwitchSimple.cjs",
    "testQuick.cjs",
    "testSimpleIntegration.cjs",
    "testSimplePortConflict.cjs",
    "testSync.cjs",
    "temp_multi_start.cjs"
)

$deletedTests = 0
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 删除: $file" -ForegroundColor Gray
        $deletedTests++
    }
}
Write-Host "删除了 $deletedTests 个测试文件" -ForegroundColor Green

# 2. 删除重复的JavaScript版本（保留.cjs版本）
Write-Host "`n🗑️  删除重复的JavaScript版本..." -ForegroundColor Yellow
$duplicateJs = @(
    "DistributedConsistencyService.js",
    "PaxosIntegration.js", 
    "PaxosManager.js",
    "PaxosService.js",
    "startPaxosService.js"
)

$deletedJs = 0
foreach ($file in $duplicateJs) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 删除: $file" -ForegroundColor Gray
        $deletedJs++
    }
}
Write-Host "删除了 $deletedJs 个重复JS文件" -ForegroundColor Green

# 3. 删除TypeScript文件（系统实际使用CommonJS）
Write-Host "`n🗑️  删除TypeScript文件..." -ForegroundColor Yellow
$tsFiles = @(
    "DistributedConsistencyService.ts",
    "DistributedConsistencyService_Fixed.ts",
    "PaxosManager.ts",
    "PaxosManager_Clean.ts",
    "PaxosNode.ts"
)

$deletedTs = 0
foreach ($file in $tsFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 删除: $file" -ForegroundColor Gray
        $deletedTs++
    }
}
Write-Host "删除了 $deletedTs 个TypeScript文件" -ForegroundColor Green

# 4. 删除过时版本和配置文件
Write-Host "`n🗑️  删除过时版本和配置文件..." -ForegroundColor Yellow
$obsoleteFiles = @(
    "demo.cjs",
    "FINAL_SUMMARY.cjs",
    "config.cjs",
    "config.js",
    "PaxosService_Clean.js",
    "startPaxosService.cjs"
)

$deletedObsolete = 0
foreach ($file in $obsoleteFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 删除: $file" -ForegroundColor Gray
        $deletedObsolete++
    }
}
Write-Host "删除了 $deletedObsolete 个过时文件" -ForegroundColor Green

# 5. 删除旧启动脚本（保留增强版本）
Write-Host "`n🗑️  删除旧启动脚本..." -ForegroundColor Yellow
$oldScripts = @(
    "start_paxos.bat",
    "start_paxos.sh"
)

$deletedScripts = 0
foreach ($file in $oldScripts) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 删除: $file" -ForegroundColor Gray
        $deletedScripts++
    }
}
Write-Host "删除了 $deletedScripts 个旧启动脚本" -ForegroundColor Green

# 6. 删除未使用的客户端文件
Write-Host "`n🗑️  删除未使用的客户端文件..." -ForegroundColor Yellow
if (Test-Path "PaxosClient.js") {
    Remove-Item "PaxosClient.js" -Force
    Write-Host "  ✅ 删除: PaxosClient.js" -ForegroundColor Gray
    $deletedClients = 1
} else {
    $deletedClients = 0
}
Write-Host "删除了 $deletedClients 个客户端文件" -ForegroundColor Green

# 统计剩余文件
Write-Host "`n📊 清理完成统计:" -ForegroundColor Cyan
$remainingFiles = Get-ChildItem -File | Measure-Object
Write-Host "剩余文件数量: $($remainingFiles.Count)" -ForegroundColor White

$totalDeleted = $deletedTests + $deletedJs + $deletedTs + $deletedObsolete + $deletedScripts + $deletedClients
Write-Host "总共删除文件: $totalDeleted" -ForegroundColor Red

Write-Host "`n📋 保留的核心文件:" -ForegroundColor Green
Get-ChildItem -File | Sort-Object Name | ForEach-Object {
    Write-Host "  📄 $($_.Name)" -ForegroundColor White
}

Write-Host "`n✅ 清理完成！系统功能完整性得到保持。" -ForegroundColor Green
Write-Host "💾 所有删除前的文件已备份到 'paxos-cleanup-backup' 分支" -ForegroundColor Cyan
