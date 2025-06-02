# 统计核心业务代码行数（排除测试和自动生成文件）
$workspaceRoot = "c:\Users\Administrator\Desktop\workspace\code"

# 定义要排除的文件和文件夹
$excludePatterns = @(
    "test/*",           # 测试文件夹
    "*.test.*",         # 测试文件
    "*.spec.*",         # 规范文件
    "package*.json",    # npm配置
    "tsconfig*.json",   # TypeScript配置
    "eslint.config.js", # ESLint配置
    "vite.config.ts",   # Vite配置
    "*.config.*",       # 其他配置文件
    "node_modules/*",   # 依赖包
    "dist/*",           # 构建输出
    "build/*",          # 构建输出
    "*.md",             # 文档文件
    "*.txt",            # 文本文件
    "*.log",            # 日志文件
    "uploads/*",        # 上传文件夹
    "bg/*",             # 背景图片
    "public/*.html",    # 测试HTML文件
    "*.svg",            # 图标文件
    "*.jpg",            # 图片文件
    "*.png",            # 图片文件
    "vite-env.d.ts"     # 自动生成的类型定义
)

# 定义要包含的核心业务代码文件扩展名
$includeExtensions = @("*.tsx", "*.ts", "*.css", "*.sql", "*.cjs", "*.html")

Write-Host "=== 核心业务代码统计 ===" -ForegroundColor Green
Write-Host "排除文件: 测试文件、配置文件、自动生成文件、资源文件" -ForegroundColor Yellow
Write-Host ""

$totalLines = 0
$totalFiles = 0
$categories = @{}

# 手动定义要统计的核心文件
$coreFiles = @(
    # 数据库
    "db_init.sql",
    # 后端核心文件
    "server.cjs",
    # 前端主要文件
    "index.html",
    # React组件
    "src/App.tsx",
    "src/App.css",
    "src/index.css",
    "src/main.tsx",
    "src/Login.tsx",
    "src/AdminDashboard.tsx",
    "src/AdminImport.tsx", 
    "src/AdminReview.tsx",
    "src/ArchiveManagement.tsx",
    "src/ArchiveViewer.tsx",
    "src/MobileStudentScore.tsx",
    "src/StudentScore.tsx",
    "src/StudentTable.tsx",
    "src/TeacherApply.tsx",
    "src/TeacherChangePassword.tsx",
    "src/TeacherHistory.tsx",
    "src/TeacherManagement.tsx",
    "src/TeacherNotifications.tsx",
    "src/TeacherViewStudents.tsx",
    # 自定义组件
    "src/components/AlertDialog.tsx",
    "src/components/ConfirmDialog.tsx", 
    "src/components/InputDialog.tsx",
    "src/components/Modal.tsx",
    # 自定义钩子
    "src/hooks/useDeviceDetection.ts",
    "src/hooks/useDialog.ts"
)

foreach ($file in $coreFiles) {
    $fullPath = Join-Path $workspaceRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -ErrorAction SilentlyContinue
        if ($content) {
            $lineCount = $content.Length
            $totalLines += $lineCount
            $totalFiles++
            
            # 分类统计
            $category = ""
            $extension = [System.IO.Path]::GetExtension($file)
            
            if ($file -like "*.sql") {
                $category = "数据库 (SQL)"
            } elseif ($file -like "server.cjs") {
                $category = "后端 (Node.js)"
            } elseif ($file -like "*.tsx" -or $file -like "*.ts") {
                $category = "前端 (React/TypeScript)"
            } elseif ($file -like "*.css") {
                $category = "样式 (CSS)"
            } elseif ($file -like "*.html") {
                $category = "标记 (HTML)"
            } else {
                $category = "其他"
            }
            
            if (-not $categories.ContainsKey($category)) {
                $categories[$category] = @{Lines = 0; Files = 0}
            }
            $categories[$category].Lines += $lineCount
            $categories[$category].Files += 1
            
            Write-Host "[$category] $file : $lineCount 行" -ForegroundColor Cyan
        }
    } else {
        Write-Host "文件不存在: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 分类统计 ===" -ForegroundColor Green
foreach ($category in $categories.Keys | Sort-Object) {
    $data = $categories[$category]
    $percentage = [math]::Round(($data.Lines / $totalLines) * 100, 1)
    Write-Host "$category : $($data.Files) 文件, $($data.Lines) 行 ($percentage%)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 总计 ===" -ForegroundColor Green
Write-Host "核心业务代码文件数: $totalFiles" -ForegroundColor White
Write-Host "核心业务代码总行数: $totalLines" -ForegroundColor White
Write-Host ""
Write-Host "注: 此统计仅包含手写的核心业务逻辑代码" -ForegroundColor Gray
Write-Host "排除了测试文件、配置文件、自动生成文件和资源文件" -ForegroundColor Gray
