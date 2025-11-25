@echo off
echo Applying invoice items migration to local SQL Server...
echo.

sqlcmd -S localhost\SQLEXPRESS -d FreelancerDB -E -i "migrations\ADD_INVOICE_ITEMS.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migration applied successfully!
) else (
    echo.
    echo Migration failed! Check the error messages above.
)

pause
