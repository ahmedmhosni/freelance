#!/bin/bash

# Apply Profile Migration to Azure SQL Database
# Run this script from Azure Cloud Shell or a machine with Azure SQL access

echo "🚀 Applying Profile Migration to Azure SQL Database"
echo "=================================================="
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login to Azure (if not already logged in)
echo "🔐 Checking Azure login status..."
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo "Please login to Azure..."
    az login
fi

# Set variables
RESOURCE_GROUP="roastify-rg"
SERVER_NAME="roastify-db-server"
DATABASE_NAME="roastifydbazure"

echo ""
echo "📊 Database Information:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Server: $SERVER_NAME"
echo "   Database: $DATABASE_NAME"
echo ""

# Check if profile fields exist
echo "🔍 Checking if profile fields exist..."
CHECK_QUERY="SELECT COUNT(*) as field_count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('username', 'job_title', 'bio', 'profile_picture', 'location', 'website', 'linkedin', 'behance', 'instagram', 'facebook', 'twitter', 'github', 'dribbble', 'portfolio', 'profile_visibility');"

FIELD_COUNT=$(az sql db query \
    --resource-group $RESOURCE_GROUP \
    --server $SERVER_NAME \
    --name $DATABASE_NAME \
    --query "results[0].rows[0][0]" \
    --output tsv \
    --query-text "$CHECK_QUERY")

echo "   Found $FIELD_COUNT profile fields"
echo ""

if [ "$FIELD_COUNT" -eq "0" ]; then
    echo "❌ Profile fields NOT found. Applying migration..."
    echo ""
    
    # Apply migration
    MIGRATION_SQL="
    -- Add profile fields to users table
    ALTER TABLE users ADD username NVARCHAR(100) NULL;
    ALTER TABLE users ADD job_title NVARCHAR(255) NULL;
    ALTER TABLE users ADD bio NVARCHAR(MAX) NULL;
    ALTER TABLE users ADD profile_picture NVARCHAR(500) NULL;
    ALTER TABLE users ADD location NVARCHAR(255) NULL;
    ALTER TABLE users ADD website NVARCHAR(500) NULL;
    ALTER TABLE users ADD linkedin NVARCHAR(500) NULL;
    ALTER TABLE users ADD behance NVARCHAR(500) NULL;
    ALTER TABLE users ADD instagram NVARCHAR(500) NULL;
    ALTER TABLE users ADD facebook NVARCHAR(500) NULL;
    ALTER TABLE users ADD twitter NVARCHAR(500) NULL;
    ALTER TABLE users ADD github NVARCHAR(500) NULL;
    ALTER TABLE users ADD dribbble NVARCHAR(500) NULL;
    ALTER TABLE users ADD portfolio NVARCHAR(500) NULL;
    ALTER TABLE users ADD profile_visibility NVARCHAR(50) DEFAULT 'public';
    
    -- Create unique index for username
    CREATE UNIQUE NONCLUSTERED INDEX idx_users_username_unique 
    ON users(username) 
    WHERE username IS NOT NULL;
    "
    
    az sql db query \
        --resource-group $RESOURCE_GROUP \
        --server $SERVER_NAME \
        --name $DATABASE_NAME \
        --query-text "$MIGRATION_SQL"
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully!"
    else
        echo "❌ Migration failed!"
        exit 1
    fi
else
    echo "✅ Profile fields already exist. No migration needed."
fi

echo ""
echo "📊 Verifying final schema..."
TOTAL_COLUMNS=$(az sql db query \
    --resource-group $RESOURCE_GROUP \
    --server $SERVER_NAME \
    --name $DATABASE_NAME \
    --query "results[0].rows[0][0]" \
    --output tsv \
    --query-text "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users';")

echo "   Total columns in users table: $TOTAL_COLUMNS"
echo ""
echo "🎉 Profile migration check complete!"
