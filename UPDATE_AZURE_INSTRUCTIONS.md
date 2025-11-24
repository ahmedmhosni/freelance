# Update Azure SQL Database Schema

## Step 1: Add Your IP to Azure Firewall

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to: **SQL servers** → **roastify-db-server** → **Networking**
3. Click **Add client IP** or add manually:
   - Rule name: `MyCurrentIP`
   - Start IP: `156.205.170.101`
   - End IP: `156.205.170.101`
4. Click **Save**
5. Wait 1-2 minutes for the rule to apply

## Step 2: Update the Schema

Run this command from the backend directory:

```bash
cd backend
node update-azure-db.js
```

This will:
- Rename `created_by` columns to `user_id` in clients, projects, tasks, invoices
- Rename `uploaded_by` to `user_id` in files
- Rename `password_hash` to `password` in users
- Update all indexes

## Step 3: Verify

Test the Azure deployment:
```bash
curl https://your-backend-url.azurewebsites.net/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Alternative: Recreate Database

If you prefer to start fresh:

1. Drop the existing database in Azure Portal
2. Create a new database
3. Run the schema script:
   ```bash
   # Using Azure Data Studio or SSMS
   # Connect to: roastify-db-server.database.windows.net
   # Run: backend/src/db/schema-azure.sql
   ```
4. Seed data:
   ```bash
   # Update backend/.env to use Azure SQL
   USE_AZURE_SQL=true
   DB_SERVER=roastify-db-server.database.windows.net
   DB_DATABASE=roastifydbazure
   DB_USER=adminuser@roastify-db-server
   DB_PASSWORD="AHmed#123456"
   
   # Run seed
   node src/db/seed.js
   ```

## Troubleshooting

**Connection timeout?**
- Make sure your IP is added to Azure SQL firewall
- Check if SQL Server is accessible: `telnet roastify-db-server.database.windows.net 1433`

**Login failed?**
- Verify username format: `adminuser@roastify-db-server`
- Check password (remember to quote if it has special characters)

**Schema already updated?**
- The script checks if columns exist before renaming
- Safe to run multiple times
