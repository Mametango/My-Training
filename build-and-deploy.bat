@echo off
echo Starting build and deploy process...

echo.
echo Step 1: Building the application...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Firebase...
cd ..
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo Deploy failed!
    pause
    exit /b 1
)

echo.
echo Build and deploy completed successfully!
echo App URL: https://my-training-8d8a9.web.app
pause 