@echo off
echo ========================================
echo Applying Theme Preference Migration
echo Local SQL Server Express
echo ========================================
echo.

REM Load environment variables
for /f "tokens=1,2 delims==" %%a in ('type ..\backend\.env ^| findstr /v "^#"') do set %%a=%%b

echo Connecting to: %DB_SERVER%\SQLEXPRESS
echo Database: %DB_DATABASE%
echo.

sqlcmd -S %DB_SERVER%\SQLEXPRESS -d %DB_DATABASE% -U %DB_USER% -P %DB_PASSWORD% -i migrations\ADD_USER_THEME_PREFERENCE.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Migration failed! Check errors above.
    echo ========================================
)

pause
