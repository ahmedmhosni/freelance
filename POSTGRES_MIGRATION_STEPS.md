# PostgreSQL Migration - Step by Step Guide

## 📋 Overview
Migrating from Azure SQL Server to PostgreSQL for better cost efficiency and scalability.

---

## 🔧 Phase 1: Local PostgreSQL Setup

### Step 1: Install PostgreSQL
**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Default credentials:
# User: postgres
# Port: 5432
```

### Step 2: Install pg npm package
```bash
cd backend
npm install pg
```

### Step 3: Create Local Database
```bash
# Open psql
psql -U postgres

# Create database
CREATE DATABASE roastify;

# Exit
\q
```

### Step 4: Run PostgreSQL Schema
```bash
cd database
psql -U postgres -d roastify -f schema-postgres.sql
```

### Step 5: Update Backend .env
Add to `backend/.env`:
```env
USE_POSTGRES=true
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=roastify
PG_USER=postgres
PG_PASSWORD=your_postgres_password
PG_SSL=false
```

### Step 6: Test Connection
```bash
cd backend
node test-postgres-connection.js
```

Expected output:
```
✓ Successfully connected to PostgreSQL!
✓ Tables found in database:
  - users
  - clients
  - projects
  ...
```

### Step 7: Start Backend with PostgreSQL
```bash
cd backend
npm start
```

Look for: `🐘 Using PostgreSQL Database`

### Step 8: Test All Endpoints
- Login/Register
- Create project
- Add task
- Create invoice
- Time tracking

---

## 📊 Phase 2: Migrate Data from Azure SQL

### Step 9: Export Data from Azure SQL
```bash
cd database
node migrate-data-to-postgres.js
```

This will:
- Connect to Azure SQL
- Export all data
- Import to local PostgreSQL
- Handle data type conversions

### Step 10: Verify Data Migration
```bash
psql -U postgres -d roastify

-- Check row counts
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices;
```

---

## ☁️ Phase 3: Azure PostgreSQL Setup

### Step 11: Create Azure Database for PostgreSQL

**Option A: Azure Portal**
1. Go to Azure Portal
2. Create Resource → Azure Database for PostgreSQL
3. Choose "Flexible Server"
4. Select region (same as your app)
5. Compute + Storage: Burstable, B1ms (cheapest ~$12/month)
6. Set admin username and password
7. Networking: Allow Azure services

**Option B: Azure CLI**
```bash
az postgres flexible-server create \
  --resource-group your-resource-group \
  --name roastify-postgres \
  --location canadaeast \
  --admin-user adminuser \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15
```

### Step 12: Configure Firewall
```bash
# Allow your IP
az postgres flexible-server firewall-rule create \
  --resource-group your-resource-group \
  --name roastify-postgres \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP

# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group your-resource-group \
  --name roastify-postgres \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Step 13: Deploy Schema to Azure PostgreSQL
```bash
# Get connection string from Azure Portal
psql "host=roastify-postgres.postgres.database.azure.com port=5432 dbname=postgres user=adminuser password=YourPassword sslmode=require"

# Create database
CREATE DATABASE roastify;
\c roastify

# Run schema
\i schema-postgres.sql
```

### Step 14: Migrate Data to Azure PostgreSQL
Update `database/migrate-data-to-postgres.js` with Azure PostgreSQL config:
```javascript
const pgConfig = {
  host: 'roastify-postgres.postgres.database.azure.com',
  port: 5432,
  database: 'roastify',
  user: 'adminuser',
  password: 'YourPassword',
  ssl: {
    rejectUnauthorized: false
  }
};
```

Run migration:
```bash
node migrate-data-to-postgres.js
```

---

## 🚀 Phase 4: Update Production App

### Step 15: Update Production Environment Variables

In Azure App Service → Configuration:
```env
USE_POSTGRES=true
USE_AZURE_SQL=false

PG_HOST=roastify-postgres.postgres.database.azure.com
PG_PORT=5432
PG_DATABASE=roastify
PG_USER=adminuser
PG_PASSWORD=YourSecurePassword123!
PG_SSL=true
```

### Step 16: Deploy Updated Backend
```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push origin main
```

### Step 17: Restart App Service
```bash
az webapp restart --name your-app-name --resource-group your-resource-group
```

### Step 18: Test Production
- Visit your production URL
- Test login
- Create test data
- Verify all features work

---

## 🧹 Phase 5: Cleanup

### Step 19: Backup Azure SQL Data
```bash
# Export to .bacpac file from Azure Portal
# Or use sqlpackage
```

### Step 20: Monitor for 1 Week
- Check logs
- Monitor performance
- Verify no errors

### Step 21: Decommission Azure SQL Server
Once confident everything works:
1. Stop Azure SQL Server
2. Wait 1 week
3. Delete Azure SQL Server
4. Save ~$5-15/month

---

## 💰 Cost Comparison

| Service | Monthly Cost |
|---------|-------------|
| Azure SQL Basic | $5-15 |
| Azure PostgreSQL Flexible (B1ms) | $12-20 |
| **Savings with alternatives:** | |
| Supabase Free Tier | $0 |
| Railway PostgreSQL | $5 |
| Render PostgreSQL | $7 |

---

## 🔍 Troubleshooting

### Connection Issues
```bash
# Test connection
psql -h your-host -U your-user -d roastify

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
# Or check Services on Windows
```

### Migration Errors
- Check data types match
- Verify foreign key constraints
- Check for duplicate data

### Performance Issues
- Add indexes if needed
- Increase connection pool size
- Monitor query performance

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed locally
- [ ] Schema created successfully
- [ ] Backend connects to PostgreSQL
- [ ] All API endpoints work
- [ ] Data migrated from Azure SQL
- [ ] Azure PostgreSQL created
- [ ] Production app updated
- [ ] All features tested in production
- [ ] Azure SQL backed up
- [ ] Azure SQL decommissioned

---

## 📚 Next Steps

1. Start with Phase 1 (Local Setup)
2. Test thoroughly locally
3. Proceed to Phase 2 (Data Migration)
4. Only move to Phase 3 when confident
5. Keep Azure SQL running for 1 week as backup

