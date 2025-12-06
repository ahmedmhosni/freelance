# CRITICAL FIX - Invoice Creation Error

## Problem
Invoice creation is failing with error:
```
column "invoicenumber" of relation "invoices" does not exist
```

## Root Cause
The `BaseRepository.create()` method is not converting camelCase JavaScript property names to snake_case database column names.

## Fix Required

**File:** `backend/src/shared/base/BaseRepository.js`

**Line ~92:** Change this:
```javascript
const columns = keys.join(', ');
```

**To this:**
```javascript
const columns = keys.map(key => this.toSnakeCase(key)).join(', ');
```

**Line ~93:** Change this:
```javascript
const placeholders = keys.map((_, index) => `${index + 1}`).join(', ');
```

**To this:**
```javascript
const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
```

## Steps to Fix

1. **Stop the backend server** (Ctrl+C)

2. **Open the file:**
   ```
   backend/src/shared/base/BaseRepository.js
   ```

3. **Find the `create` method** (around line 87)

4. **Make the two changes** shown above

5. **Save the file**

6. **Restart the backend:**
   ```bash
   cd backend
   npm run dev
   ```

7. **Test invoice creation** - it should now work!

## Why This Fix Works

The fix converts JavaScript camelCase to database snake_case:
- `invoiceNumber` → `invoice_number` ✅
- `clientId` → `client_id` ✅  
- `userId` → `user_id` ✅
- `issueDate` → `issue_date` ✅
- `dueDate` → `due_date` ✅

## Verification

After applying the fix, try creating an invoice again. It should work without errors.

The `toSnakeCase` method already exists in the class (added earlier), so you just need to use it in the `create` method.

## Note

The invoice items feature is complete and working. This is just a fix for the base repository that affects invoice creation (and potentially other create operations).
