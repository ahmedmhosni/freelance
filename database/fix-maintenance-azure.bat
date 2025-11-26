@echo off
echo ============================================
echo APPLYING MAINTENANCE_CONTENT TABLE MIGRATION
echo ============================================
echo.
echo This will add the maintenance_content table to Azure PostgreSQL
echo.
pause

cd ..
node database/apply-maintenance-content-azure.js

echo.
echo ============================================
echo DONE!
echo ============================================
pause
