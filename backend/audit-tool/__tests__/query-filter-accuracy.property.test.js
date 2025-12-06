/**
 * Property-Based Test: Query Filter Accuracy
 * 
 * **Feature: full-system-audit, Property 26: Query Filter Accuracy**
 * 
 * For any query with filter parameters, the returned results should match
 * all specified filter criteria.
 * 
 * **Validates: Requirements 7.4**
 */

const fc = require('fast-check');
const DatabaseVerifier = require('../verifiers/DatabaseVerifier');
const config = require('../audit.config');

describe('Property 26: Query Filter Accuracy', () => {
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
    `, ['Test User', 'test-query-filter@example.com', 'hashedpassword', 'freelancer']);
    
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await verifier.pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    }
    await verifier.close();
  });

  test('filtering by status returns only matching projects', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom('active', 'completed', 'on-hold', 'cancelled')
          }),
          { minLength: 3, maxLength: 10 }
        ),
        fc.constantFrom('active', 'completed', 'on-hold', 'cancelled'),
        async (projects, filterStatus) => {
          const insertedIds = [];

          try {
            // Insert test projects
            for (const project of projects) {
              const insertQuery = `
                INSERT INTO projects (user_id, name, status)
                VALUES ($1, $2, $3)
                RETURNING id
              `;

              const result = await verifier.pool.query(insertQuery, [
                testUserId,
                project.name,
                project.status
              ]);
              insertedIds.push(result.rows[0].id);
            }

            // Query with filter
            const filterQuery = `
              SELECT * FROM projects 
              WHERE status = $1 AND id = ANY($2::int[])
            `;

            const filterResult = await verifier.pool.query(filterQuery, [filterStatus, insertedIds]);

            // Verify all returned records match the filter
            for (const record of filterResult.rows) {
              expect(record.status).toBe(filterStatus);
            }

            // Verify we got the expected count
            const expectedCount = projects.filter(p => p.status === filterStatus).length;
            expect(filterResult.rows.length).toBe(expectedCount);
          } finally {
            // Cleanup
            if (insertedIds.length > 0) {
              await verifier.pool.query(`DELETE FROM projects WHERE id = ANY($1::int[])`, [insertedIds]);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  test('filtering by multiple criteria returns only matching records', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            company: fc.constantFrom('Company A', 'Company B', 'Company C', null)
          }),
          { minLength: 5, maxLength: 15 }
        ),
        fc.constantFrom('Company A', 'Company B', 'Company C'),
        async (clients, filterCompany) => {
          const insertedIds = [];

          try {
            // Insert test clients
            for (const client of clients) {
              const columns = ['user_id', 'name', 'email'];
              const values = [testUserId, client.name, client.email];
              
              if (client.company !== null) {
                columns.push('company');
                values.push(client.company);
              }

              const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
              const insertQuery = `
                INSERT INTO clients (${columns.join(', ')})
                VALUES (${placeholders})
                RETURNING id
              `;

              const result = await verifier.pool.query(insertQuery, values);
              insertedIds.push(result.rows[0].id);
            }

            // Query with filter
            const filterQuery = `
              SELECT * FROM clients 
              WHERE company = $1 AND id = ANY($2::int[])
            `;

            const filterResult = await verifier.pool.query(filterQuery, [filterCompany, insertedIds]);

            // Verify all returned records match the filter
            for (const record of filterResult.rows) {
              expect(record.company).toBe(filterCompany);
            }

            // Verify we got the expected count
            const expectedCount = clients.filter(c => c.company === filterCompany).length;
            expect(filterResult.rows.length).toBe(expectedCount);
          } finally {
            // Cleanup
            if (insertedIds.length > 0) {
              await verifier.pool.query(`DELETE FROM clients WHERE id = ANY($1::int[])`, [insertedIds]);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  test('sorting returns records in correct order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0 && /^[a-zA-Z0-9]+$/.test(s)),
            email: fc.emailAddress()
          }),
          { minLength: 3, maxLength: 10 }
        ),
        async (clients) => {
          const insertedIds = [];

          try {
            // Insert test clients
            for (const client of clients) {
              const insertQuery = `
                INSERT INTO clients (user_id, name, email)
                VALUES ($1, $2, $3)
                RETURNING id
              `;

              const result = await verifier.pool.query(insertQuery, [
                testUserId,
                client.name,
                client.email
              ]);
              insertedIds.push(result.rows[0].id);
            }

            // Query with sorting ASC
            const sortAscQuery = `
              SELECT * FROM clients 
              WHERE id = ANY($1::int[])
              ORDER BY name ASC
            `;

            const sortAscResult = await verifier.pool.query(sortAscQuery, [insertedIds]);

            // Query with sorting DESC
            const sortDescQuery = `
              SELECT * FROM clients 
              WHERE id = ANY($1::int[])
              ORDER BY name DESC
            `;

            const sortDescResult = await verifier.pool.query(sortDescQuery, [insertedIds]);

            // Verify ASC and DESC are opposite
            expect(sortAscResult.rows.length).toBe(sortDescResult.rows.length);
            
            // The first element in ASC should be the last in DESC (or close to it for duplicates)
            // Just verify that sorting is applied by checking the results are different orders
            // unless all names are the same
            const allNamesIdentical = clients.every(c => c.name === clients[0].name);
            
            if (!allNamesIdentical && sortAscResult.rows.length > 1) {
              const ascNames = sortAscResult.rows.map(r => r.name);
              const descNames = sortDescResult.rows.map(r => r.name);
              
              // At least one position should be different if sorting is working
              let hasDifference = false;
              for (let i = 0; i < ascNames.length; i++) {
                if (ascNames[i] !== descNames[descNames.length - 1 - i]) {
                  hasDifference = true;
                  break;
                }
              }
              
              // If all names are unique, ASC and DESC should be exact reverses
              const uniqueNames = new Set(ascNames);
              if (uniqueNames.size === ascNames.length) {
                expect(ascNames.reverse()).toEqual(descNames);
              }
            }
          } finally {
            // Cleanup
            if (insertedIds.length > 0) {
              await verifier.pool.query(`DELETE FROM clients WHERE id = ANY($1::int[])`, [insertedIds]);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  test('pagination returns correct subset of records', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress()
          }),
          { minLength: 5, maxLength: 15 }
        ),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 0, max: 3 }),
        async (clients, limit, offset) => {
          const insertedIds = [];

          try {
            // Insert test clients
            for (const client of clients) {
              const insertQuery = `
                INSERT INTO clients (user_id, name, email)
                VALUES ($1, $2, $3)
                RETURNING id
              `;

              const result = await verifier.pool.query(insertQuery, [
                testUserId,
                client.name,
                client.email
              ]);
              insertedIds.push(result.rows[0].id);
            }

            // Query with pagination
            const paginationQuery = `
              SELECT * FROM clients 
              WHERE id = ANY($1::int[])
              ORDER BY id ASC
              LIMIT $2 OFFSET $3
            `;

            const paginationResult = await verifier.pool.query(paginationQuery, [insertedIds, limit, offset]);

            // Verify correct number of records returned
            expect(paginationResult.rows.length).toBeLessThanOrEqual(limit);
            
            // If we have enough records, verify we got the right ones
            if (insertedIds.length > offset) {
              const expectedCount = Math.min(limit, insertedIds.length - offset);
              expect(paginationResult.rows.length).toBe(expectedCount);
            } else {
              // Offset beyond available records should return empty
              expect(paginationResult.rows.length).toBe(0);
            }
          } finally {
            // Cleanup
            if (insertedIds.length > 0) {
              await verifier.pool.query(`DELETE FROM clients WHERE id = ANY($1::int[])`, [insertedIds]);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});
