# Azure App Service Configuration for PostgreSQL

## Environment Variables to Update

Go to Azure Portal → Your App Service → Configuration → Application settings

Add/Update these variables:

```
# Database Configuration
USE_POSTGRES=true
USE_AZURE_SQL=false

# PostgreSQL Connection
PG_HOST=roastifydbpost.postgres.database.azure.com
PG_PORT=5432
PG_DATABASE=roastifydb
PG_USER=adminuser
PG_PASSWORD=AHmed#123456
PG_SSL=true

# Keep existing settings
NODE_ENV=production
PORT=8080
JWT_SECRET=roastify-azure-production-secret-key-2024-change-this-to-something-more-secure
JWT_EXPIRES_IN=7d

# Email Configuration (keep existing)
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://roastifyemail.europe.communication.azure.com/;accesskey=5n3xW27OBEh5mK0tQm9gnafnqkaFsyP2ErqH8EnEDV5ToU3aYFvsJQQJ99BKACULyCptyCYmAAAAAZCSEYcP
EMAIL_FROM=donotreply@roastify.online

# Application Configuration (keep existing)
APP_URL=https://roastify.online
APP_NAME=Roastify
FRONTEND_URL=https://roastify.online

# File Uploads (keep existing)
UPLOAD_DIR=/home/site/wwwroot/uploads
MAX_FILE_SIZE=52428800

# Logging
LOG_LEVEL=info
```

## Steps to Update:

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your App Service (roastify-webapp-api)
3. Click "Configuration" in the left menu
4. Click "Application settings"
5. Add/Update the variables above
6. Click "Save"
7. Click "Continue" when prompted
8. The app will restart automatically

## After Configuration:

The backend will automatically:
- ✅ Use PostgreSQL in production
- ✅ Use SQLite for local development
- ✅ Connect to Azure PostgreSQL database
- ✅ All existing features will work

