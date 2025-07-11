@echo off
echo Pushing to GitHub...

echo Adding all changes...
call git add .

echo Committing changes...
call git commit -m "Auto update: %date% %time%"

echo Pushing to GitHub...
call git push origin master

if %errorlevel% equ 0 (
    echo Successfully pushed to GitHub!
    echo Repository: https://github.com/Mametango/My-Training
) else (
    echo Failed to push to GitHub!
)

pause 