# Routes PostgreSQL Conversion Guide

## Pattern to Follow:

### OLD (SQL Server):
```javascript
const pool = await db;
const request = pool.request();
request.input('email', sql.NVarChar, email);
const result = await request.query('SELECT * FROM users WHERE email = @email');
const user = result.recordset[0];
```

### NEW (PostgreSQL):
```javascript
const { query } = require('../db/postgresql');
const result = await query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0];
```

## Key Changes:

1. Remove `sql.NVarChar` type declarations
2. Change `@param` to `$1, $2, $3`
3. Change `result.recordset` to `result.rows`
4. Change `OUTPUT INSERTED.*` to `RETURNING *`
5. Change `GETDATE()` to `NOW()`
6. Remove `const pool = await db`

## Files to Update:

1. backend/src/routes/auth.js
2. backend/src/routes/clients.js
3. backend/src/routes/projects.js
4. backend/src/routes/tasks.js
5. backend/src/routes/invoices.js
6. backend/src/routes/invoiceItems.js
7. backend/src/routes/dashboard.js
8. backend/src/routes/maintenance.js
9. backend/src/routes/profile.js
10. backend/src/routes/userPreferences.js

I'll update these now...
