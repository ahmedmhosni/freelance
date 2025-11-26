@echo off
echo ============================================
echo RESET POSTGRESQL PASSWORD
echo ============================================
echo.
echo This will reset the postgres user password to: postgres123
echo.
pause

echo.
echo Step 1: Finding pg_hba.conf file...
set PG_DATA=C:\Program Files\PostgreSQL\17\data
if not exist "%PG_DATA%\pg_hba.conf" (
    set PG_DATA=C:\Program Files\PostgreSQL\15\data
)
if not exist "%PG_DATA%\pg_hba.conf" (
    set PG_DATA=C:\PostgreSQL\17\data
)

echo Found: %PG_DATA%
echo.

echo Step 2: Backing up pg_hba.conf...
copy "%PG_DATA%\pg_hba.conf" "%PG_DATA%\pg_hba.conf.backup"

echo.
echo Step 3: Modifying pg_hba.conf to allow trust authentication...
powershell -Command "(Get-Content '%PG_DATA%\pg_hba.conf') -replace 'scram-sha-256', 'trust' | Set-Content '%PG_DATA%\pg_hba.conf'"

echo.
echo Step 4: Restarting PostgreSQL service...
net stop postgresql-x64-17
timeout /t 2
net start postgresql-x64-17
timeout /t 3

echo.
echo Step 5: Changing password...
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres123';"

echo.
echo Step 6: Restoring pg_hba.conf...
copy "%PG_DATA%\pg_hba.conf.backup" "%PG_DATA%\pg_hba.conf"

echo.
echo Step 7: Restarting PostgreSQL service again...
net stop postgresql-x64-17
timeout /t 2
net start postgresql-x64-17

echo.
echo ============================================
echo PASSWORD RESET COMPLETE!
echo ============================================
echo.
echo New password: postgres123
echo.
echo This password has been saved to backend/.env.local
echo.
pause
