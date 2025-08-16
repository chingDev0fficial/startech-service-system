@echo off
REM =========================
REM Laravel Localhost Development Server
REM =========================
echo Starting Laravel development environment on localhost...
echo.

REM =========================
REM Set localhost configuration
REM =========================
set LOCAL_HOST=localhost
set LOCAL_IP=127.0.0.1
set APP_PORT=8000
set VITE_PORT=5173
set REVERB_PORT=8080

echo Configuration:
echo - Host: %LOCAL_HOST%
echo - IP: %LOCAL_IP%
echo - Laravel Port: %APP_PORT%
echo - Vite Port: %VITE_PORT%
echo - Reverb Port: %REVERB_PORT%
echo.

REM =========================
REM Update Laravel APP_URL for localhost
REM =========================
set APP_URL=http://%LOCAL_HOST%:%APP_PORT%
powershell -Command "(gc .env) -replace 'APP_URL=.*', 'APP_URL=%APP_URL%' | Out-File -encoding ASCII .env"
echo Updated APP_URL to %APP_URL%

REM =========================
REM Update other localhost settings in .env
REM =========================
powershell -Command "(gc .env) -replace 'REACT_APP_API_URL=.*', 'REACT_APP_API_URL=%APP_URL%' | Out-File -encoding ASCII .env"
powershell -Command "(gc .env) -replace 'REVERB_HOST=.*', 'REVERB_HOST=%LOCAL_HOST%' | Out-File -encoding ASCII .env"
powershell -Command "(gc .env) -replace 'VITE_REVERB_HOST=.*', 'VITE_REVERB_HOST=\"%LOCAL_HOST%\"' | Out-File -encoding ASCII .env"
powershell -Command "(gc .env) -replace 'DB_HOST=.*', 'DB_HOST=%LOCAL_HOST%' | Out-File -encoding ASCII .env"

echo Updated localhost configuration in .env
echo.

REM =========================
REM Clear Laravel cache
REM =========================
echo Clearing Laravel cache...
php artisan config:clear >nul 2>&1
php artisan cache:clear >nul 2>&1
php artisan view:clear >nul 2>&1
php artisan route:clear >nul 2>&1
echo Cache cleared.
echo.

REM =========================
REM Check if Reverb is properly configured
REM =========================
echo Checking Reverb configuration...
php artisan reverb:install --without-interaction >nul 2>&1
echo Reverb configuration checked.
echo.

REM =========================
REM Start development servers
REM =========================
echo Starting development servers...
echo.

REM Start Laravel Server (Backend) first
echo Starting Laravel development server...
start "Laravel Server" cmd /k "echo Laravel Development Server && echo URL: %APP_URL% && echo Press Ctrl+C to stop && echo. && php artisan serve --host=%LOCAL_HOST% --port=%APP_PORT%"

REM Wait a moment before starting other services
timeout /t 3 >nul

REM Start Vite Dev Server (Frontend)
echo Starting Vite development server...
start "Vite Dev Server" cmd /k "echo Vite Dev Server (Frontend) && echo URL: http://%LOCAL_HOST%:%VITE_PORT% && echo Press Ctrl+C to stop && echo. && npx vite --host %LOCAL_HOST% --port %VITE_PORT%"

REM Wait a moment before starting background services
timeout /t 2 >nul

REM Start Queue Worker
echo Starting Laravel Queue Worker...
start "Queue Worker" cmd /k "echo Laravel Queue Worker && echo Processing background jobs... && echo Press Ctrl+C to stop && echo. && php artisan queue:work --verbose --timeout=90"

REM Start Reverb Server (WebSocket) - Fixed command
echo Starting Laravel Reverb server...
start "Reverb Server" cmd /k "echo Laravel Reverb WebSocket Server && echo URL: ws://%LOCAL_HOST%:%REVERB_PORT% && echo Press Ctrl+C to stop && echo. && php artisan reverb:start --host=0.0.0.0 --port=%REVERB_PORT%"

echo.
echo =========================
echo All servers started successfully!
echo =========================
echo.
echo Your Laravel application is now running on:
echo Frontend (Vite): http://%LOCAL_HOST%:%VITE_PORT%
echo Backend (Laravel): %APP_URL%
echo WebSocket (Reverb): ws://%LOCAL_HOST%:%REVERB_PORT%
echo Queue Worker: Running in background
echo.
echo Check the opened terminal windows for server logs.
echo.
echo To stop all servers:
echo - Close all opened terminal windows
echo - Or press Ctrl+C in each terminal window
echo.

REM =========================
REM Optional: Open browser
REM =========================
set /p OPEN_BROWSER="Open browser automatically? (y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    echo Opening browser...
    timeout /t 2 >nul
    start "" "%APP_URL%"
)

echo.
echo Press any key to exit this launcher...
pause >nul
