@echo off
echo ============================================
echo FIXING MAINTENANCE_CONTENT TABLE
echo ============================================
echo.

set PGHOST=roastifydbpost.postgres.database.azure.com
set PGUSER=adminuser
set PGPORT=5432
set PGDATABASE=roastifydb
set PGPASSWORD=AHmed#123456

echo Connecting to Azure PostgreSQL...
echo Host: %PGHOST%
echo Database: %PGDATABASE%
echo.

psql -f QUICK_FIX_MAINTENANCE.sql

echo.
echo ============================================
echo DONE!
echo ============================================
pause
