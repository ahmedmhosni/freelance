@echo off
echo ============================================
echo SETUP LOCAL POSTGRESQL DATABASE
echo ============================================
echo.
echo This will:
echo 1. Create database 'roastify_local'
echo 2. Run schema migration
echo 3. Create maintenance_content table
echo 4. Seed admin user
echo.
pause

echo.
echo Step 1: Creating database...
psql -U postgres -c "DROP DATABASE IF EXISTS roastify_local;"
psql -U postgres -c "CREATE DATABASE roastify_local;"

echo.
echo Step 2: Running schema migration...
psql -U postgres -d roastify_local -f schema-postgres.sql

echo.
echo Step 3: Verifying tables...
psql -U postgres -d roastify_local -c "\dt"

echo.
echo Step 4: Checking maintenance_content table...
psql -U postgres -d roastify_local -c "SELECT * FROM maintenance_content;"

echo.
echo ============================================
echo SETUP COMPLETE!
echo ============================================
echo.
echo Next steps:
echo 1. Update backend/.env with local PostgreSQL settings
echo 2. Run: cd backend ^&^& npm start
echo.
pause
