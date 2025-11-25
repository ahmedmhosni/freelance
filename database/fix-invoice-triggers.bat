@echo off
echo Fixing invoice triggers to prevent recursion...
echo.

REM Load environment variables from backend .env file
for /f "tokens=1,2 delims==" %%a in ('type ..\backend\.env ^| findstr /v "^#"') do (
    set %%a=%%b
)

REM Extract server and database from connection string
for /f "tokens=2 delims=;" %%a in ("%DB_CONNECTION_STRING%") do (
    for /f "tokens=2 delims==" %%b in ("%%a") do set DB_SERVER=%%b
)
for /f "tokens=4 delims=;" %%a in ("%DB_CONNECTION_STRING%") do (
    for /f "tokens=2 delims==" %%b in ("%%a") do set DB_NAME=%%b
)

echo Server: %DB_SERVER%
echo Database: %DB_NAME%
echo.

REM Apply the migration
sqlcmd -S %DB_SERVER% -d %DB_NAME% -E -i migrations\FIX_INVOICE_TRIGGERS.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Invoice triggers fixed successfully!
) else (
    echo.
    echo ✗ Error fixing triggers
    exit /b 1
)

pause
