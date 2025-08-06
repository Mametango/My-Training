# 改善版デプロイスクリプト
param(
    [switch]$SkipBuild,
    [switch]$Verbose
)

# エラーハンドリングを有効化
$ErrorActionPreference = "Stop"

Write-Host "Starting improved deploy process..." -ForegroundColor Green

try {
    if (-not $SkipBuild) {
        Write-Host "Step 1: Building the application..." -ForegroundColor Yellow
        Set-Location "client"
        
        # npm run buildを実行
        $buildResult = npm run build 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build failed!" -ForegroundColor Red
            Write-Host $buildResult -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Build completed successfully!" -ForegroundColor Green
        Set-Location ".."
    }
    
    Write-Host "Step 2: Deploying to Firebase..." -ForegroundColor Yellow
    
    # Firebaseデプロイを実行
    $deployResult = firebase deploy --only hosting 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Deploy failed!" -ForegroundColor Red
        Write-Host $deployResult -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Deploy completed successfully!" -ForegroundColor Green
    Write-Host "App URL: https://my-training-8d8a9.web.app" -ForegroundColor Cyan
    
} catch {
    Write-Host "An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "All done!" -ForegroundColor Green 