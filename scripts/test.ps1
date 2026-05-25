Write-Host "🧪 Testing XAPI Project..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All dependencies installed" -ForegroundColor Green

# Check project structure
Write-Host "📁 Checking project structure..." -ForegroundColor Cyan

$requiredFiles = @(
    "docker-compose.yml",
    "backend/package.json",
    "backend/src/app.ts",
    "frontend/package.json",
    "frontend/src/app/layout.tsx",
    ".env.example"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Missing required file: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Project structure complete" -ForegroundColor Green

# Check for required directories
Write-Host "📁 Checking directories..." -ForegroundColor Cyan

$requiredDirs = @(
    "backend/src/adapters",
    "backend/src/core",
    "backend/src/routes",
    "frontend/src/app",
    "frontend/src/components",
    "docs"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        Write-Host "❌ Missing required directory: $dir" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ All directories present" -ForegroundColor Green

# Count files
Write-Host "📊 File statistics:" -ForegroundColor Cyan
$adapterCount = (Get-ChildItem "backend/src/adapters/*.ts" -ErrorAction SilentlyContinue).Count
$pageCount = (Get-ChildItem "frontend/src/app\(*\)*.tsx" -ErrorAction SilentlyContinue).Count
$docCount = (Get-ChildItem "docs/*.md" -ErrorAction SilentlyContinue).Count

Write-Host "  Backend adapters: $adapterCount"
Write-Host "  Frontend pages: $pageCount"
Write-Host "  Documentation: $docCount"

Write-Host ""
Write-Host "✅ XAPI project validation completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Configure environment variables in .env" -ForegroundColor White
Write-Host "  2. Run: docker-compose up -d" -ForegroundColor White
Write-Host "  3. Visit: http://localhost:3000" -ForegroundColor White
