/**
 * Property-Based Test: Database Round-Trip Consistency
 * 
 * **Feature: full-system-audit, Property 12: Database Round-Trip Consistency**
 * 
 * For any data written to the database through an API endpoint,
 * reading that data back should return equivalent values.
 * 
 * **Validates: Requirements 3.4, 7.1**
 */

const fc = require('fast-check');
const DatabaseVerifier = require('../verifiers/DatabaseVerifier');
const config = require('../audit.config');

describe('Property 12: Database Round-Trip Consistency', () => {
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
    `, ['Test User', 'test-db-roundtrip@example.com', 'hashedpassword', 'freelancer']);
    
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await verifier.pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    }
    await verifier.close();
  });

  test('database round-trip consistency for clients table', async () => {
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
          // Add the test user_id
          const dataWithUserId = { ...clientData, user_id: testUserId };
          
          // Insert the data
          const columns = Object.keys(dataWithUserId).filter(k => dataWithUserId[k] !== null);
          const values = columns.map(k => dataWithUserId[k]);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO clients (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING *
          `;

          const insertResult = await verifier.pool.query(insertQuery, values);
          const insertedRecord = insertResult.rows[0];
          const insertedId = insertedRecord.id;

          try {
            // Read the data back
            const selectQuery = `SELECT * FROM clients WHERE id = $1`;
            const selectResult = await verifier.pool.query(selectQuery, [insertedId]);
            const retrievedRecord = selectResult.rows[0];

            // Verify data matches (excluding auto-generated fields)
            expect(retrievedRecord).toBeDefined();
            expect(retrievedRecord.name).toBe(clientData.name);
            expect(retrievedRecord.email).toBe(clientData.email);
            expect(retrievedRecord.phone).toBe(clientData.phone === undefined ? null : clientData.phone);
            expect(retrievedRecord.company).toBe(clientData.company === undefined ? null : clientData.company);
            expect(retrievedRecord.notes).toBe(clientData.notes === undefined ? null : clientData.notes);
            expect(retrievedRecord.user_id).toBe(testUserId);
          } finally {
            // Cleanup
            await verifier.pool.query(`DELETE FROM clients WHERE id = $1`, [insertedId]);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('database round-trip consistency for projects table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          description: fc.option(fc.string({ maxLength: 500 })),
          status: fc.constantFrom('active', 'completed', 'on-hold', 'cancelled'),
          budget: fc.option(fc.double({ min: 0, max: 1000000, noNaN: true }))
        }),
        async (projectData) => {
          // Add the test user_id
          const dataWithUserId = { ...projectData, user_id: testUserId };
          
          // Insert the data
          const columns = Object.keys(dataWithUserId).filter(k => dataWithUserId[k] !== null);
          const values = columns.map(k => dataWithUserId[k]);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO projects (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING *
          `;

          const insertResult = await verifier.pool.query(insertQuery, values);
          const insertedId = insertResult.rows[0].id;

          try {
            // Read the data back
            const selectQuery = `SELECT * FROM projects WHERE id = $1`;
            const selectResult = await verifier.pool.query(selectQuery, [insertedId]);
            const retrievedRecord = selectResult.rows[0];

            // Verify data matches
            expect(retrievedRecord).toBeDefined();
            expect(retrievedRecord.name).toBe(projectData.name);
            expect(retrievedRecord.description).toBe(projectData.description === undefined ? null : projectData.description);
            expect(retrievedRecord.status).toBe(projectData.status);
            expect(retrievedRecord.user_id).toBe(testUserId);
            
            if (projectData.budget !== null && projectData.budget !== undefined) {
              expect(parseFloat(retrievedRecord.budget)).toBeCloseTo(projectData.budget, 2);
            }
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
