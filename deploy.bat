@echo off
echo Starting deployment process...

echo Building client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Deploying to Firebase...
cd ..
call firebase deploy --only hosting --non-interactive
if %errorlevel% neq 0 (
    echo Deployment failed!
    pause
    exit /b 1
)

echo Deployment completed successfully!
echo URL: https://my-routine-app-a0708.web.app
pause 