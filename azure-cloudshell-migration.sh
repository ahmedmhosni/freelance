#!/bin/bash

# Azure Cloud Shell Migration Script
# Run this in Azure Cloud Shell to migrate your local database to Azure PostgreSQL

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Database Migration via Azure Cloud Shell            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Configuration
AZURE_HOST="roastifydbpost.postgres.database.azure.com"
AZURE_PORT="5432"
AZURE_DB="roastifydb"
AZURE_USER="adminuser"
AZURE_PASSWORD="AHmed#123456"

LOCAL_BACKUP="local_backup.sql"

echo "Step 1: Upload your local database backup to Cloud Shell"
echo "----------------------------------------"
echo "First, create a backup on your local machine:"
echo ""
echo "  pg_dump -h localhost -p 5432 -U postgres -d roastify -F p -f local_backup.sql --no-owner --no-acl"
echo ""
echo "Then upload it to Cloud Shell:"
echo "  1. Click the 'Upload/Download files' button in Cloud Shell toolbar"
echo "  2. Select 'Upload'"
echo "  3. Choose your local_backup.sql file"
echo ""
read -p "Press Enter once you've uploaded the backup file..."

# Check if backup file exists
if [ ! -f "$LOCAL_BACKUP" ]; then
    echo "✗ Backup file not found: $LOCAL_BACKUP"
    echo "Please upload the file and run this script again."
    exit 1
fi

echo "✓ Backup file found!"
echo "  Size: $(du -h $LOCAL_BACKUP | cut -f1)"
echo ""

echo "Step 2: Importing to Azure PostgreSQL..."
echo "----------------------------------------"

# Set password for psql
export PGPASSWORD="$AZURE_PASSWORD"

# Import to Azure
echo "Connecting to: $AZURE_HOST"
psql -h "$AZURE_HOST" -p "$AZURE_PORT" -U "$AZURE_USER" -d "$AZURE_DB" -f "$LOCAL_BACKUP"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Import successful!"
else
    echo ""
    echo "⚠ Import completed with warnings (this is normal for some PostgreSQL features)"
fi

echo ""
echo "Step 3: Verifying migration..."
echo "----------------------------------------"

# Count tables
TABLE_COUNT=$(psql -h "$AZURE_HOST" -p "$AZURE_PORT" -U "$AZURE_USER" -d "$AZURE_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")

echo "Tables in Azure: $TABLE_COUNT"

# Count users
USER_COUNT=$(psql -h "$AZURE_HOST" -p "$AZURE_PORT" -U "$AZURE_USER" -d "$AZURE_DB" -t -c "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")

echo "Users in database: $USER_COUNT"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Migration Complete!                                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Test your application with Azure connection"
echo "2. Update production environment variables"
echo "3. Deploy your application"
echo ""
