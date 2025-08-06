@echo off
echo Quick Deploy - My Training App
echo ================================

cd client
echo Building...
npm run build
if errorlevel 1 goto error

cd ..
echo Deploying...
firebase deploy --only hosting
if errorlevel 1 goto error

echo.
echo SUCCESS! App deployed to: https://my-training-8d8a9.web.app
goto end

:error
echo.
echo ERROR: Deployment failed!
pause
exit /b 1

:end
echo.
echo Press any key to exit...
pause >nul 