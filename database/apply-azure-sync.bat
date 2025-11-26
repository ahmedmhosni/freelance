@echo off
echo ========================================
echo Applying Azure Database Sync Migration
echo ========================================
echo.

REM Load environment variables from backend/.env.azure
for /f "tokens=1,2 delims==" %%a in ('type ..\backend\.env.azure ^| findstr /v "^#"') do (
    set %%a=%%b
)

echo Connecting to Azure SQL Database...
echo Server: %DB_SERVER%
echo Database: %DB_NAME%
echo.

sqlcmd -S %DB_SERVER% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -i migrations\SYNC_AZURE_WITH_LOCAL.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration applied successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Migration failed! Check errors above.
    echo ========================================
)

pause
