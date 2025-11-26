@echo off
echo ========================================
echo Fixing Tasks Table on Azure
echo ========================================
echo.

sqlcmd -S roastify-db-server.database.windows.net -d roastifydbazure -U adminuser@roastify-db-server -P "AHmed#123456" -i migrations\FIX_TASKS_ASSIGNED_TO.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Fix applied successfully!
    echo ========================================
    echo.
    echo The backend should now work without 500 errors.
    echo You may need to restart the Azure App Service.
) else (
    echo.
    echo ========================================
    echo Fix failed! Check errors above.
    echo ========================================
)

pause
