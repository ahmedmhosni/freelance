@echo off
echo ============================================
echo STARTING LOCAL DEVELOPMENT ENVIRONMENT
echo ============================================
echo.

REM Copy local env file
echo Copying local environment configuration...
copy /Y backend\.env.local backend\.env

echo.
echo Starting Backend Server...
echo.
start cmd /k "cd backend && npm start"

timeout /t 5

echo.
echo Starting Frontend Development Server...
echo.
start cmd /k "cd frontend && npm start"

echo.
echo ============================================
echo DEVELOPMENT SERVERS STARTING
echo ============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause > nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq *npm start*" /F

echo.
echo Servers stopped.
pause
