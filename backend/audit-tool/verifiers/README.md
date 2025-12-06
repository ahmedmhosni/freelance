# Database Verifier

The DatabaseVerifier class provides comprehensive database testing and verification capabilities for the audit tool.

## Features

### Connection Testing
- Verifies database connectivity
- Measures connection latency
- Handles connection errors gracefully

### Table Verification
- Checks all required tables exist
- Compares against expected schema
- Identifies missing or extra tables

### CRUD Operation Testing
- Tests INSERT, SELECT, UPDATE, DELETE operations
- Verifies data integrity after each operation
- Automatically cleans up test data

### Query Verification
- Tests filtering with WHERE clauses
- Tests sorting with ORDER BY
- Tests pagination with LIMIT and OFFSET
- Verifies query results match criteria

### Transaction Testing
- Tests transaction COMMIT
- Tests transaction ROLLBACK
- Verifies ACID properties
- Tests concurrent transactions

## Usage

```javascript
const DatabaseVerifier = require('./verifiers/DatabaseVerifier');
const config = require('./audit.config');

// Create verifier instance
const verifier = new DatabaseVerifier(config.database);

// Verify connection
const connectionResult = await verifier.verifyConnection();
console.log('Connected:', connectionResult.connected);
console.log('Latency:', connectionResult.latency, 'ms');

// Verify tables
const tableResult = await verifier.verifyTables();
console.log('All tables exist:', tableResult.success);
console.log('Missing tables:', tableResult.missing);

// Test CRUD operations
const crudResult = await verifier.verifyCRUD('clients', {
  user_id: 1,
  name: 'Test Client',
  email: 'test@example.com'
});
console.log('CRUD tests passed:', crudResult.insert.success && crudResult.select.success);

// Test queries
const queryResult = await verifier.verifyQuery('clients', [
  { user_id: 1, name: 'Client 1', email: 'client1@example.com' },
  { user_id: 1, name: 'Client 2', email: 'client2@example.com' }
]);
console.log('Query tests passed:', queryResult.filtering.success);

// Test transactions
const transactionResult = await verifier.verifyTransaction('clients', {
  user_id: 1,
  name: 'Test Client',
  email: 'test@example.com'
});
console.log('Transaction tests passed:', transactionResult.commit.success);

// Close connection
await verifier.close();
```

## Property-Based Tests

The DatabaseVerifier is tested using property-based testing with fast-check:

### Property 12: Database Round-Trip Consistency
For any data written to the database, reading it back should return equivalent values.

### Property 24: Update Operation Data Preservation
For any update operation, fields not included in the update should retain their original values.

### Property 25: Delete Operation Completeness
For any delete operation, the target record should be removed and no longer retrievable.

### Property 26: Query Filter Accuracy
For any query with filter parameters, the returned results should match all specified criteria.

### Property 27: Transaction Atomicity
For any operation wrapped in a transaction, if any part fails, all changes should be rolled back.

## Configuration

Configure the database connection in `audit.config.js`:

```javascript
database: {
  host: 'localhost',
  port: 5432,
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123',
  ssl: false
}
```

## Error Handling

The DatabaseVerifier handles errors gracefully:
- Connection failures return error details
- Failed operations don't crash the verifier
- Test data is cleaned up even if tests fail
- Detailed error messages for debugging

## Requirements Validated

- **7.1**: Data creation with all required fields
- **7.2**: Data updates without data loss
- **7.3**: Data deletion and cascading deletes
- **7.4**: Accurate filtered and sorted query results
- **7.5**: Transaction ACID properties
- **10.2**: Database connectivity verification
