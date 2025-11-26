# Set Local PostgreSQL Password

You need to update the password in `backend/.env.local`

## Option 1: Edit the file
1. Open `backend/.env.local`
2. Find line: `PG_PASSWORD=postgres`
3. Change to your actual postgres password
4. Save the file

## Option 2: If you don't remember your password

### Reset PostgreSQL password:

1. Find `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\17\data\`)
2. Open as Administrator
3. Find line: `host    all             all             127.0.0.1/32            scram-sha-256`
4. Change to: `host    all             all             127.0.0.1/32            trust`
5. Restart PostgreSQL service
6. Run: `psql -U postgres`
7. Run: `ALTER USER postgres PASSWORD 'your_new_password';`
8. Change `pg_hba.conf` back to `scram-sha-256`
9. Restart PostgreSQL service

## Option 3: Use environment variable
```bash
set PGPASSWORD=your_password
cd backend
node test-local-setup.js
```

## After setting password:
```bash
cd backend
node test-local-setup.js
```

Should see:
```
✅ Connected successfully
✅ Found 11 tables
✅ All tests passed!
```
