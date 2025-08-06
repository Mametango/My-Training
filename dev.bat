@echo off
echo Starting development environment...
echo.

echo Starting Firebase Functions emulator...
start "Firebase Functions" cmd /k "cd functions && npm run serve"

echo Waiting for Functions to start...
timeout /t 5 /nobreak > nul

echo Starting React client...
start "React Client" cmd /k "cd client && npm start"

echo Development environment started!
echo - Firebase Functions: http://localhost:5001
echo - React Client: http://localhost:3000
echo.
pause 