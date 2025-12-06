/**
 * Property-Based Test: Update Operation Data Preservation
 * 
 * **Feature: full-system-audit, Property 24: Update Operation Data Preservation**
 * 
 * For any update operation on a database record, fields not included in the update
 * should retain their original values.
 * 
 * **Validates: Requirements 7.2**
 */

const fc = require('fast-check');
const DatabaseVerifier = require('../verifiers/DatabaseVerifier');
const config = require('../audit.config');

describe('Property 24: Update Operation Data Preservation', () => {
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
    `, ['Test User', 'test-update-preservation@example.com', 'hashedpassword', 'freelancer']);
    
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await verifier.pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    }
    await verifier.close();
  });

  test('update operation preserves unmodified fields in clients table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          phone: fc.string({ minLength: 5, maxLength: 20 }),
          company: fc.string({ minLength: 1, maxLength: 100 }),
          notes: fc.string({ maxLength: 500 })
        }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (initialData, updatedName) => {
          // Insert initial record
          const insertQuery = `
            INSERT INTO clients (user_id, name, email, phone, company, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;

          const insertResult = await verifier.pool.query(insertQuery, [
            testUserId,
            initialData.name,
            initialData.email,
            initialData.phone,
            initialData.company,
            initialData.notes
          ]);

          const insertedId = insertResult.rows[0].id;

          try {
            // Update only the name field
            const updateQuery = `
              UPDATE clients 
              SET name = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
              RETURNING *
            `;

            await verifier.pool.query(updateQuery, [updatedName, insertedId]);

            // Read the record back
            const selectQuery = `SELECT * FROM clients WHERE id = $1`;
            const selectResult = await verifier.pool.query(selectQuery, [insertedId]);
            const updatedRecord = selectResult.rows[0];

            // Verify updated field changed
            expect(updatedRecord.name).toBe(updatedName);

            // Verify other fields preserved
            expect(updatedRecord.email).toBe(initialData.email);
            expect(updatedRecord.phone).toBe(initialData.phone);
            expect(updatedRecord.company).toBe(initialData.company);
            expect(updatedRecord.notes).toBe(initialData.notes);
            expect(updatedRecord.user_id).toBe(testUserId);
          } finally {
            // Cleanup
            await verifier.pool.query(`DELETE FROM clients WHERE id = $1`, [insertedId]);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('update operation preserves unmodified fields in projects table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          description: fc.string({ maxLength: 500 }),
          status: fc.constantFrom('active', 'completed', 'on-hold', 'cancelled'),
          budget: fc.double({ min: 0, max: 1000000, noNaN: true })
        }),
        fc.constantFrom('active', 'completed', 'on-hold', 'cancelled'),
        async (initialData, updatedStatus) => {
          // Insert initial record
          const insertQuery = `
            INSERT INTO projects (user_id, name, description, status, budget)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `;

          const insertResult = await verifier.pool.query(insertQuery, [
            testUserId,
            initialData.name,
            initialData.description,
            initialData.status,
            initialData.budget
          ]);

          const insertedId = insertResult.rows[0].id;

          try {
            // Update only the status field
            const updateQuery = `
              UPDATE projects 
              SET status = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
              RETURNING *
            `;

            await verifier.pool.query(updateQuery, [updatedStatus, insertedId]);

            // Read the record back
            const selectQuery = `SELECT * FROM projects WHERE id = $1`;
            const selectResult = await verifier.pool.query(selectQuery, [insertedId]);
            const updatedRecord = selectResult.rows[0];

            // Verify updated field changed
            expect(updatedRecord.status).toBe(updatedStatus);

            // Verify other fields preserved
            expect(updatedRecord.name).toBe(initialData.name);
            expect(updatedRecord.description).toBe(initialData.description);
            expect(parseFloat(updatedRecord.budget)).toBeCloseTo(initialData.budget, 2);
            expect(updatedRecord.user_id).toBe(testUserId);
          } finally {
            // Cleanup
            await verifier.pool.query(`DELETE FROM projects WHERE id = $1`, [insertedId]);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
