/**
 * Property-Based Test: Transaction Atomicity
 * 
 * **Feature: full-system-audit, Property 27: Transaction Atomicity**
 * 
 * For any operation wrapped in a database transaction, if any part fails,
 * all changes should be rolled back.
 * 
 * **Validates: Requirements 7.5**
 */

const fc = require('fast-check');
const DatabaseVerifier = require('../verifiers/DatabaseVerifier');
const config = require('../audit.config');

describe('Property 27: Transaction Atomicity', () => {
  let verifier;
  let testUserId;

  beforeAll(async () => {
    verifier = new DatabaseVerifier(config.database);
    const connectionResult = await verifier.verifyConnection();
    
    if (!connectionResult.connected) {
      throw new Error(`Database connection failed: ${connectionResult.error}`);
    }

    // Create a test user for foreign key relationships
    const userResult = await verifier.pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, ['Test User', 'test-transaction-atomicity@example.com', 'hashedpassword', 'freelancer']);
    
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await verifier.pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    }
    await verifier.close();
  });

  test('transaction rollback prevents any changes when error occurs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          client1Name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          client1Email: fc.emailAddress(),
          client2Name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          client2Email: fc.emailAddress()
        }),
        async (testData) => {
          const client = await verifier.pool.connect();

          try {
            // Start transaction
            await client.query('BEGIN');

            // Insert first client (should succeed)
            const insert1Query = `
              INSERT INTO clients (user_id, name, email)
              VALUES ($1, $2, $3)
              RETURNING id
            `;

            const result1 = await client.query(insert1Query, [
              testUserId,
              testData.client1Name,
              testData.client1Email
            ]);
            const client1Id = result1.rows[0].id;

            // Insert second client (should succeed)
            const insert2Query = `
              INSERT INTO clients (user_id, name, email)
              VALUES ($1, $2, $3)
              RETURNING id
            `;

            const result2 = await client.query(insert2Query, [
              testUserId,
              testData.client2Name,
              testData.client2Email
            ]);
            const client2Id = result2.rows[0].id;

            // Intentionally cause an error (insert with invalid foreign key)
            try {
              const invalidInsertQuery = `
                INSERT INTO projects (user_id, client_id, name, status)
                VALUES ($1, $2, $3, $4)
              `;

              await client.query(invalidInsertQuery, [
                999999, // Invalid user_id
                client1Id,
                'Test Project',
                'active'
              ]);

              // If we get here, the invalid insert didn't fail (unexpected)
              await client.query('ROLLBACK');
              throw new Error('Expected foreign key constraint violation');
            } catch (error) {
              // Expected error - rollback the transaction
              await client.query('ROLLBACK');

              // Verify that BOTH clients were rolled back
              const verifyQuery = `SELECT * FROM clients WHERE id = ANY($1::int[])`;
              const verifyResult = await client.query(verifyQuery, [[client1Id, client2Id]]);

              // Both inserts should be rolled back
              expect(verifyResult.rows.length).toBe(0);
            }
          } finally {
            client.release();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  test('transaction commit persists all changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          clientName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          clientEmail: fc.emailAddress(),
          projectName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
        }),
        async (testData) => {
          const client = await verifier.pool.connect();
          let clientId, projectId;

          try {
            // Start transaction
            await client.query('BEGIN');

            // Insert client
            const insertClientQuery = `
              INSERT INTO clients (user_id, name, email)
              VALUES ($1, $2, $3)
              RETURNING id
            `;

            const clientResult = await client.query(insertClientQuery, [
              testUserId,
              testData.clientName,
              testData.clientEmail
            ]);
            clientId = clientResult.rows[0].id;

            // Insert project linked to client
            const insertProjectQuery = `
              INSERT INTO projects (user_id, client_id, name, status)
              VALUES ($1, $2, $3, $4)
              RETURNING id
            `;

            const projectResult = await client.query(insertProjectQuery, [
              testUserId,
              clientId,
              testData.projectName,
              'active'
            ]);
            projectId = projectResult.rows[0].id;

            // Commit transaction
            await client.query('COMMIT');

            // Verify both records exist after commit
            const verifyClientQuery = `SELECT * FROM clients WHERE id = $1`;
            const verifyClientResult = await client.query(verifyClientQuery, [clientId]);
            expect(verifyClientResult.rows.length).toBe(1);
            expect(verifyClientResult.rows[0].name).toBe(testData.clientName);

            const verifyProjectQuery = `SELECT * FROM projects WHERE id = $1`;
            const verifyProjectResult = await client.query(verifyProjectQuery, [projectId]);
            expect(verifyProjectResult.rows.length).toBe(1);
            expect(verifyProjectResult.rows[0].name).toBe(testData.projectName);
            expect(verifyProjectResult.rows[0].client_id).toBe(clientId);
          } finally {
            // Cleanup
            if (projectId) {
              await client.query(`DELETE FROM projects WHERE id = $1`, [projectId]);
            }
            if (clientId) {
              await client.query(`DELETE FROM clients WHERE id = $1`, [clientId]);
            }
            client.release();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  test('nested operations in transaction are atomic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress()
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (clients) => {
          const client = await verifier.pool.connect();
          const insertedIds = [];

          try {
            // Start transaction
            await client.query('BEGIN');

            // Insert multiple clients
            for (const clientData of clients) {
              const insertQuery = `
                INSERT INTO clients (user_id, name, email)
                VALUES ($1, $2, $3)
                RETURNING id
              `;

              const result = await client.query(insertQuery, [
                testUserId,
                clientData.name,
                clientData.email
              ]);
              insertedIds.push(result.rows[0].id);
            }

            // Verify all are visible within transaction
            const verifyInTransactionQuery = `SELECT * FROM clients WHERE id = ANY($1::int[])`;
            const verifyInTransactionResult = await client.query(verifyInTransactionQuery, [insertedIds]);
            expect(verifyInTransactionResult.rows.length).toBe(clients.length);

            // Rollback
            await client.query('ROLLBACK');

            // Verify none exist after rollback
            const verifyAfterRollbackQuery = `SELECT * FROM clients WHERE id = ANY($1::int[])`;
            const verifyAfterRollbackResult = await client.query(verifyAfterRollbackQuery, [insertedIds]);
            expect(verifyAfterRollbackResult.rows.length).toBe(0);
          } finally {
            client.release();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});
