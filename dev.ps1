Write-Host "Starting development environment..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Firebase Functions emulator..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd functions; npm run serve" -WindowStyle Normal

Write-Host "Waiting for Functions to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting React client..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start" -WindowStyle Normal

Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "- Firebase Functions: http://localhost:5001" -ForegroundColor Cyan
Write-Host "- React Client: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue" 