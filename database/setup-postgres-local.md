# PostgreSQL Local Setup Guide

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Default port: 5432
4. Remember the password you set for the `postgres` user
5. Install pgAdmin 4 (comes with installer) for GUI management

### Alternative: Using Docker
```bash
docker run --name roastify-postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:15
```

## Step 2: Create Database

### Using psql command line:
```bash
psql -U postgres
CREATE DATABASE roastify;
\q
```

### Using pgAdmin:
1. Open pgAdmin
2. Right-click "Databases"
3. Create > Database
4. Name: roastify
5. Click Save

## Step 3: Run Schema

```bash
cd database
psql -U postgres -d roastify -f schema-postgres.sql
```

Or using pgAdmin:
1. Select roastify database
2. Tools > Query Tool
3. Open schema-postgres.sql
4. Execute (F5)

## Step 4: Update Backend Environment

Create or update `backend/.env`:

```env
# Database Type
USE_POSTGRES=true

# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=roastify
PG_USER=postgres
PG_PASSWORD=your_password_here
PG_SSL=false

# Keep other settings...
PORT=5000
NODE_ENV=development
JWT_SECRET=YourIpisSecure_forlongertimeNow
JWT_EXPIRES_IN=7d
```

## Step 5: Install PostgreSQL Driver

```bash
cd backend
npm install pg
```

## Step 6: Update Database Index

Update `backend/src/db/index.js` to use PostgreSQL:

```javascript
const usePostgres = process.env.USE_POSTGRES === 'true';

if (usePostgres) {
  console.log('🐘 Using PostgreSQL Database');
  module.exports = require('./postgres');
} else if (useAzureSQL) {
  console.log('🔵 Using Azure SQL Database');
  module.exports = require('./azuresql');
} else {
  console.log('🟢 Using SQLite Database (Local Development)');
  module.exports = require('./database');
}
```

## Step 7: Test Connection

```bash
cd backend
node test-db-connection.js
```

## Step 8: Start Backend

```bash
cd backend
npm start
```

You should see: "✓ Connected to PostgreSQL database"

## Troubleshooting

### Connection refused
- Check if PostgreSQL service is running
- Windows: Services > postgresql-x64-15
- Check port 5432 is not blocked

### Authentication failed
- Verify password in .env matches PostgreSQL user password
- Check pg_hba.conf for authentication method

### Database doesn't exist
- Create database first: `CREATE DATABASE roastify;`

## Next Steps

1. Test all API endpoints
2. Verify data operations work
3. Check invoice generation
4. Test time tracking
5. Once confirmed working, proceed to Azure PostgreSQL setup

