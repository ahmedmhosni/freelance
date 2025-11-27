@echo off
echo ====================================
echo Azure PostgreSQL Schema Deployment
echo ====================================
echo.

REM Set the Azure database password (handles special characters)
set AZURE_DB_PASSWORD=YourPassword

echo Running schema deployment...
node deploy-full-schema-azure.js

echo.
echo Done!
pause
