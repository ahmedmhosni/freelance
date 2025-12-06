/**
 * Property-Based Test: Delete Operation Completeness
 * 
 * **Feature: full-system-audit, Property 25: Delete Operation Completeness**
 * 
 * For any delete operation, the target record should be removed from the database
 * and no longer retrievable.
 * 
 * **Validates: Requirements 7.3**
 */

const fc = require('fast-check');
const DatabaseVerifier = require('../verifiers/DatabaseVerifier');
const config = require('../audit.config');

describe('Property 25: Delete Operation Completeness', () => {
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
    `, ['Test User', 'test-delete-completeness@example.com', 'hashedpassword', 'freelancer']);
    
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await verifier.pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    }
    await verifier.close();
  });

  test('delete operation completely removes record from clients table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          phone: fc.option(fc.string({ minLength: 5, maxLength: 20 })),
          company: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          notes: fc.option(fc.string({ maxLength: 500 }))
        }),
        async (clientData) => {
          // Insert a record
          const dataWithUserId = { ...clientData, user_id: testUserId };
          const columns = Object.keys(dataWithUserId).filter(k => dataWithUserId[k] !== null && dataWithUserId[k] !== undefined);
          const values = columns.map(k => dataWithUserId[k]);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO clients (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING id
          `;

          const insertResult = await verifier.pool.query(insertQuery, values);
          const insertedId = insertResult.rows[0].id;

          // Verify record exists
          const verifyInsertQuery = `SELECT * FROM clients WHERE id = $1`;
          const verifyInsertResult = await verifier.pool.query(verifyInsertQuery, [insertedId]);
          expect(verifyInsertResult.rows.length).toBe(1);

          // Delete the record
          const deleteQuery = `DELETE FROM clients WHERE id = $1 RETURNING id`;
          const deleteResult = await verifier.pool.query(deleteQuery, [insertedId]);
          
          // Verify delete returned the deleted id
          expect(deleteResult.rows.length).toBe(1);
          expect(deleteResult.rows[0].id).toBe(insertedId);

          // Verify record no longer exists
          const verifyDeleteQuery = `SELECT * FROM clients WHERE id = $1`;
          const verifyDeleteResult = await verifier.pool.query(verifyDeleteQuery, [insertedId]);
          expect(verifyDeleteResult.rows.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('delete operation completely removes record from projects table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          description: fc.option(fc.string({ maxLength: 500 })),
          status: fc.constantFrom('active', 'completed', 'on-hold', 'cancelled'),
          budget: fc.option(fc.double({ min: 0, max: 1000000, noNaN: true }))
        }),
        async (projectData) => {
          // Insert a record
          const dataWithUserId = { ...projectData, user_id: testUserId };
          const columns = Object.keys(dataWithUserId).filter(k => dataWithUserId[k] !== null && dataWithUserId[k] !== undefined);
          const values = columns.map(k => dataWithUserId[k]);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO projects (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING id
          `;

          const insertResult = await verifier.pool.query(insertQuery, values);
          const insertedId = insertResult.rows[0].id;

          // Verify record exists
          const verifyInsertQuery = `SELECT * FROM projects WHERE id = $1`;
          const verifyInsertResult = await verifier.pool.query(verifyInsertQuery, [insertedId]);
          expect(verifyInsertResult.rows.length).toBe(1);

          // Delete the record
          const deleteQuery = `DELETE FROM projects WHERE id = $1 RETURNING id`;
          const deleteResult = await verifier.pool.query(deleteQuery, [insertedId]);
          
          // Verify delete returned the deleted id
          expect(deleteResult.rows.length).toBe(1);
          expect(deleteResult.rows[0].id).toBe(insertedId);

          // Verify record no longer exists
          const verifyDeleteQuery = `SELECT * FROM projects WHERE id = $1`;
          const verifyDeleteResult = await verifier.pool.query(verifyDeleteQuery, [insertedId]);
          expect(verifyDeleteResult.rows.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('cascading delete removes dependent records', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          clientName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          clientEmail: fc.emailAddress(),
          projectName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
        }),
        async (testData) => {
          // Insert a client
          const clientInsertQuery = `
            INSERT INTO clients (user_id, name, email)
            VALUES ($1, $2, $3)
            RETURNING id
          `;

          const clientResult = await verifier.pool.query(clientInsertQuery, [
            testUserId,
            testData.clientName,
            testData.clientEmail
          ]);
          const clientId = clientResult.rows[0].id;

          // Insert a project linked to the client
          const projectInsertQuery = `
            INSERT INTO projects (user_id, client_id, name, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `;

          const projectResult = await verifier.pool.query(projectInsertQuery, [
            testUserId,
            clientId,
            testData.projectName,
            'active'
          ]);
          const projectId = projectResult.rows[0].id;

          // Verify both records exist
          const verifyClientQuery = `SELECT * FROM clients WHERE id = $1`;
          const verifyClientResult = await verifier.pool.query(verifyClientQuery, [clientId]);
          expect(verifyClientResult.rows.length).toBe(1);

          const verifyProjectQuery = `SELECT * FROM projects WHERE id = $1`;
          const verifyProjectResult = await verifier.pool.query(verifyProjectQuery, [projectId]);
          expect(verifyProjectResult.rows.length).toBe(1);

          // Delete the client (should cascade to project via ON DELETE SET NULL)
          const deleteClientQuery = `DELETE FROM clients WHERE id = $1`;
          await verifier.pool.query(deleteClientQuery, [clientId]);

          // Verify client is deleted
          const verifyClientDeletedQuery = `SELECT * FROM clients WHERE id = $1`;
          const verifyClientDeletedResult = await verifier.pool.query(verifyClientDeletedQuery, [clientId]);
          expect(verifyClientDeletedResult.rows.length).toBe(0);

          // Verify project still exists but client_id is null (ON DELETE SET NULL)
          const verifyProjectAfterQuery = `SELECT * FROM projects WHERE id = $1`;
          const verifyProjectAfterResult = await verifier.pool.query(verifyProjectAfterQuery, [projectId]);
          expect(verifyProjectAfterResult.rows.length).toBe(1);
          expect(verifyProjectAfterResult.rows[0].client_id).toBeNull();

          // Cleanup project
          await verifier.pool.query(`DELETE FROM projects WHERE id = $1`, [projectId]);
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});
