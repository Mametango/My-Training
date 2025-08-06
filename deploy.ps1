Write-Host "Starting deployment process..." -ForegroundColor Green

Write-Host "Building client..." -ForegroundColor Yellow
Set-Location "client"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
Set-Location ".."
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "URL: https://my-training-8d8a9.web.app" -ForegroundColor Cyan
Read-Host "Press Enter to continue" 