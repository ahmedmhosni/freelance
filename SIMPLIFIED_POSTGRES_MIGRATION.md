# Simplified PostgreSQL Migration Strategy

## 🎯 New Approach: SQLite Local + PostgreSQL Production

### Why This is Better:
1. ✅ **No local PostgreSQL setup needed** - Keep using SQLite locally
2. ✅ **Simpler development** - SQLite is lightweight and fast
3. ✅ **Production-ready** - PostgreSQL for scalability and features
4. ✅ **Industry standard** - This is how most apps work (Rails, Django, etc.)
5. ✅ **Less complexity** - No need to manage PostgreSQL locally

---

## 📋 Simplified Migration Plan

### Phase 1: Update Backend (Already Done! ✅)
- ✅ PostgreSQL adapter created
- ✅ Database index supports both SQLite and PostgreSQL
- ✅ Environment variable switching ready

### Phase 2: Create Azure PostgreSQL
1. Create Azure Database for PostgreSQL
2. Run schema on Azure PostgreSQL
3. Update production environment variables

### Phase 3: Migrate Data
1. Export data from Azure SQL Server
2. Import to Azure PostgreSQL
3. Test production

### Phase 4: Deploy & Cleanup
1. Deploy backend to production
2. Test everything
3. Decommission Azure SQL Server

---

## 🔧 Configuration

### Local Development (.env)
```env
# Keep SQLite for local development
USE_POSTGRES=false
USE_AZURE_SQL=false

# SQLite will be used automatically
```

### Production (.env.production or Azure App Service Config)
```env
# Use PostgreSQL in production
USE_POSTGRES=true
USE_AZURE_SQL=false

PG_HOST=your-postgres-server.postgres.database.azure.com
PG_PORT=5432
PG_DATABASE=roastify
PG_USER=adminuser
PG_PASSWORD=your_secure_password
PG_SSL=true
```

---

## 🚀 Next Steps

### Step 1: Create Azure PostgreSQL (Do this now)
```bash
# Option A: Azure Portal
1. Go to Azure Portal
2. Create Resource → Azure Database for PostgreSQL Flexible Server
3. Choose cheapest tier (Burstable, B1ms ~$12/month)
4. Set admin credentials
5. Allow Azure services in firewall

# Option B: Azure CLI
az postgres flexible-server create \
  --resource-group your-rg \
  --name roastify-postgres \
  --location canadaeast \
  --admin-user adminuser \
  --admin-password "SecurePass123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15
```

### Step 2: Deploy Schema to Azure PostgreSQL
```bash
# Connect to Azure PostgreSQL
psql "host=roastify-postgres.postgres.database.azure.com port=5432 dbname=postgres user=adminuser password=YourPassword sslmode=require"

# Create database
CREATE DATABASE roastify;
\c roastify

# Run schema
\i database/schema-postgres.sql
```

### Step 3: Migrate Data from Azure SQL to Azure PostgreSQL
```bash
# Update migrate-data-to-postgres.js with Azure PostgreSQL config
node database/migrate-data-to-postgres.js
```

### Step 4: Update Production Environment
In Azure App Service Configuration:
```
USE_POSTGRES=true
PG_HOST=roastify-postgres.postgres.database.azure.com
PG_PORT=5432
PG_DATABASE=roastify
PG_USER=adminuser
PG_PASSWORD=your_password
PG_SSL=true
```

### Step 5: Deploy & Test
```bash
git add .
git commit -m "Add PostgreSQL support for production"
git push origin main
```

---

## 💰 Cost Savings

| Service | Monthly Cost |
|---------|-------------|
| Azure SQL Server (current) | $5-15 |
| Azure PostgreSQL Flexible B1ms | $12-20 |
| **Net Change** | ~$0-5 more |

**But you get:**
- Better performance
- More features (JSON, full-text search)
- Better scaling options
- Open source (no vendor lock-in)

**Even Better Options:**
- Supabase: $0-25/month (includes auth, storage, realtime)
- Railway: $5/month
- Render: $7/month

---

## ✅ Benefits of This Approach

1. **Local Development**
   - Fast SQLite database
   - No PostgreSQL installation needed
   - Easy to reset/test

2. **Production**
   - Powerful PostgreSQL
   - Better for concurrent users
   - Advanced features available

3. **Flexibility**
   - Can switch databases anytime
   - Easy to test both locally
   - No code changes needed

---

## 🎯 Current Status

- ✅ Backend supports both SQLite and PostgreSQL
- ✅ PostgreSQL adapter ready
- ✅ Migration scripts ready
- ⏳ Waiting to create Azure PostgreSQL
- ⏳ Waiting to migrate data
- ⏳ Waiting to deploy

---

## 📝 Summary

**You don't need to set up PostgreSQL locally!**

Just:
1. Create Azure PostgreSQL
2. Run schema
3. Migrate data
4. Update production config
5. Deploy

Your local development stays exactly the same with SQLite!

