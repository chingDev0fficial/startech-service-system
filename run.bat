
@echo off

REM =========================
REM Detect local network IP
REM =========================
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr "IPv4"') do (
    set LOCAL_IP=%%A
)
set LOCAL_IP=%LOCAL_IP: =%
echo Your local IP: %LOCAL_IP%
pause

REM =========================
REM Update Laravel APP_URL dynamically
REM =========================
set APP_URL=http://%LOCAL_IP%:8000
powershell -Command "(gc .env) -replace 'APP_URL=.*', 'APP_URL=%APP_URL%' | Out-File -encoding ASCII .env"
echo Updated APP_URL to %APP_URL%

REM =========================
REM Start servers
REM =========================
start "Vite Dev" cmd /k "npx vite --host %LOCAL_IP%"
start "Laravel Server" cmd /k "php artisan serve --host=%LOCAL_IP% --port=8000"
start "Queue Worker" cmd /k "php artisan queue:work"
start "Scheduler Worker" cmd /k "php artisan schedule:work"
start "Reverb Server" cmd /k "php artisan reverb:start --host=0.0.0.0 --port=8080 --hostname=%LOCAL_IP%"

echo All servers started. Check the new terminal windows.
pause
