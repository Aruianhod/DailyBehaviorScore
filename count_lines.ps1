# 统计代码行数脚本 - 排除测试文件和自动生成文件

Write-Host "🔍 正在统计日常行为分管理系统的代码行数..." -ForegroundColor Green
Write-Host ""

# 需要统计的文件类型和路径
$sourceFiles = @(
    # 前端 TypeScript/JavaScript 文件
    "src\*.tsx",
    "src\*.ts", 
    "src\components\*.tsx",
    "src\components\*.ts",
    "src\hooks\*.tsx",
    "src\hooks\*.ts",
    
    # 后端文件
    "server.cjs",
    
    # 数据库文件
    "db_init.sql",
    
    # 样式文件
    "src\*.css",
    
    # HTML 文件 (排除测试)
    "index.html"
)

# 排除的文件模式
$excludePatterns = @(
    "*test*",
    "*Test*", 
    "*spec*",
    "vite-env.d.ts",
    "package*.json",
    "tsconfig*.json",
    "eslint*.js",
    "vite.config.ts"
)

$totalLines = 0
$totalFiles = 0
$fileDetails = @()

Write-Host "📁 文件分类统计:" -ForegroundColor Yellow
Write-Host ""

# 按类型分组统计
$categories = @{
    "前端组件 (TSX)" = @("src\*.tsx", "src\components\*.tsx")
    "前端 Hooks/工具 (TS)" = @("src\hooks\*.ts", "src\*.ts")
    "后端服务器 (CJS)" = @("server.cjs")
    "数据库 (SQL)" = @("db_init.sql") 
    "样式文件 (CSS)" = @("src\*.css")
    "HTML 模板" = @("index.html")
}

foreach ($category in $categories.Keys) {
    $categoryLines = 0
    $categoryFiles = 0
    
    Write-Host "🗂️  $category" -ForegroundColor Cyan
    
    foreach ($pattern in $categories[$category]) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            # 检查是否应该排除
            $shouldExclude = $false
            foreach ($excludePattern in $excludePatterns) {
                if ($file.Name -like $excludePattern) {
                    $shouldExclude = $true
                    break
                }
            }
            
            if (-not $shouldExclude) {
                $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
                if ($content) {
                    $lineCount = $content.Count
                    $categoryLines += $lineCount
                    $categoryFiles++
                    $totalLines += $lineCount
                    $totalFiles++
                    
                    $fileDetails += [PSCustomObject]@{
                        Category = $category
                        File = $file.Name
                        Lines = $lineCount
                        Path = $file.FullName
                    }
                    
                    Write-Host "   📄 $($file.Name): $lineCount 行" -ForegroundColor White
                }
            }
        }
    }
    
    if ($categoryFiles -gt 0) {
        Write-Host "   📊 小计: $categoryFiles 个文件, $categoryLines 行代码" -ForegroundColor Green
    } else {
        Write-Host "   📊 小计: 0 个文件" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "===========================================" -ForegroundColor Magenta
Write-Host "📈 总体统计:" -ForegroundColor Yellow
Write-Host "   📁 总文件数: $totalFiles" -ForegroundColor White
Write-Host "   📝 总代码行数: $totalLines" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Magenta
Write-Host ""

# 详细文件列表
Write-Host "📋 详细文件列表:" -ForegroundColor Yellow
$fileDetails | Sort-Object Category, Lines -Descending | Format-Table -AutoSize

# 统计不同类型文件的占比
Write-Host "📊 代码分布占比:" -ForegroundColor Yellow
$categories.Keys | ForEach-Object {
    $categoryName = $_
    $categoryTotal = ($fileDetails | Where-Object { $_.Category -eq $categoryName } | Measure-Object -Property Lines -Sum).Sum
    if ($categoryTotal -gt 0) {
        $percentage = [math]::Round(($categoryTotal / $totalLines) * 100, 1)
        Write-Host "   $categoryName : $categoryTotal 行 ($percentage%)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "✅ 统计完成！" -ForegroundColor Green
