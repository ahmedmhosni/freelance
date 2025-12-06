# Fix BaseRepository - CamelCase to Snake_Case Conversion

## Issue
The BaseRepository's `create` method is not converting camelCase property names to snake_case database column names, causing this error:

```
column "invoicenumber" of relation "invoices" does not exist
```

## Solution

In `backend/src/shared/base/BaseRepository.js`, update the `create` method:

### Find this line (around line 92):
```javascript
const columns = keys.join(', ');
```

### Replace with:
```javascript
const columns = keys.map(key => this.toSnakeCase(key)).join(', ');
```

### Also find this line (around line 93):
```javascript
const placeholders = keys.map((_, index) => `${index + 1}`).join(', ');
```

### Replace with:
```javascript
const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
```

## Complete Fixed Method

The `create` method should look like this:

```javascript
async create(data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  const columns = keys.map(key => this.toSnakeCase(key)).join(', ');
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  
  const sql = `
    INSERT INTO ${this.tableName} (${columns})
    VALUES (${placeholders})
    RETURNING *
  `;

  return await this.db.queryOne(sql, values);
}
```

## How to Apply

1. Open `backend/src/shared/base/BaseRepository.js`
2. Find the `create` method (around line 87-102)
3. Update the two lines as shown above
4. Save the file
5. Restart the backend server

## After Fix

The invoice creation will work correctly, converting:
- `invoiceNumber` → `invoice_number`
- `clientId` → `client_id`
- `userId` → `user_id`
- etc.
