@echo off
echo ========================================
echo Checking Azure Users Table Schema
echo ========================================
echo.

sqlcmd -S roastify-db-server.database.windows.net -d roastifydbazure -U adminuser@roastify-db-server -P "AHmed#123456" -i check-users-columns.sql

echo.
echo ========================================
echo Check Complete
echo ========================================
pause
