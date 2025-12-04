const request = require('supertest');
const { bootstrap } = require('../../core/bootstrap');

describe('Performance: Old vs New Architecture Comparison', () => {
  let app;
  let container;
  let authToken;
  let testUserId;

  beforeAll(async () => {
    const result = await bootstrap();
    app = result.app;
    container = result.container;

    // Register and login test user
    const registerResponse = await request(app)
      .post('/api/v2/auth/register')
      .send({
        email: 'comparison-test@example.com',
        password: 'ComparisonTest123!',
        name: 'Comparison Test User'
      });

    authToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    const database = container.resolve('database');
    await database.execute('DELETE FROM users WHERE id = $1', [testUserId]);
    await database.close();
  });

  describe('Client Endpoints Comparison', () => {
    test('should compare GET /clients performance', async () => {
      // Test old endpoint (if exists)
      let oldTime = null;
      try {
        const oldStart = Date.now();
        await request(app)
          .get('/api/clients')
          .set('Authorization', `Bearer ${authToken}`);
        oldTime = Date.now() - oldStart;
      } catch (error) {
        // Old endpoint might not exist
        oldTime = null;
      }

      // Test new endpoint
      const newStart = Date.now();
      await request(app)
        .get('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const newTime = Date.now() - newStart;

      console.log(`Old endpoint: ${oldTime}ms, New endpoint: ${newTime}ms`);

      // New endpoint should be reasonably fast
      expect(newTime).toBeLessThan(300);

      // If old endpoint exists, new should be comparable or better
      if (oldTime !== null) {
        expect(newTime).toBeLessThanOrEqual(oldTime * 1.2); // Allow 20% margin
      }
    });

    test('should compare POST /clients performance', async () => {
      const clientData = {
        name: 'Performance Comparison Client',
        email: 'perfcomp@example.com'
      };

      // Test old endpoint (if exists)
      let oldTime = null;
      let oldClientId = null;
      try {
        const oldStart = Date.now();
        const oldResponse = await request(app)
          .post('/api/clients')
          .set('Authorization', `Bearer ${authToken}`)
          .send(clientData);
        oldTime = Date.now() - oldStart;
        oldClientId = oldResponse.body.id;
      } catch (error) {
        oldTime = null;
      }

      // Test new endpoint
      const newStart = Date.now();
      const newResponse = await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(201);
      const newTime = Date.now() - newStart;
      const newClientId = newResponse.body.id;

      console.log(`Old POST: ${oldTime}ms, New POST: ${newTime}ms`);

      // New endpoint should be reasonably fast
      expect(newTime).toBeLessThan(400);

      // Cleanup
      const database = container.resolve('database');
      if (oldClientId) {
        await database.execute('DELETE FROM clients WHERE id = $1', [oldClientId]);
      }
      if (newClientId) {
        await database.execute('DELETE FROM clients WHERE id = $1', [newClientId]);
      }

      // If old endpoint exists, new should be comparable or better
      if (oldTime !== null) {
        expect(newTime).toBeLessThanOrEqual(oldTime * 1.2);
      }
    });
  });

  describe('Query Optimization Comparison', () => {
    let clientIds = [];

    beforeAll(async () => {
      // Create test data
      const database = container.resolve('database');
      for (let i = 0; i < 30; i++) {
        const result = await database.queryOne(
          'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
          [testUserId, `Query Test Client ${i}`, `querytest${i}@example.com`]
        );
        clientIds.push(result.id);
      }
    });

    afterAll(async () => {
      const database = container.resolve('database');
      for (const id of clientIds) {
        await database.execute('DELETE FROM clients WHERE id = $1', [id]);
      }
    });

    test('should compare pagination performance', async () => {
      // Test old endpoint (if exists)
      let oldTime = null;
      try {
        const oldStart = Date.now();
        await request(app)
          .get('/api/clients?limit=10&offset=0')
          .set('Authorization', `Bearer ${authToken}`);
        oldTime = Date.now() - oldStart;
      } catch (error) {
        oldTime = null;
      }

      // Test new endpoint
      const newStart = Date.now();
      await request(app)
        .get('/api/v2/clients?limit=10&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const newTime = Date.now() - newStart;

      console.log(`Old pagination: ${oldTime}ms, New pagination: ${newTime}ms`);

      expect(newTime).toBeLessThan(250);

      if (oldTime !== null) {
        expect(newTime).toBeLessThanOrEqual(oldTime * 1.2);
      }
    });

    test('should compare search performance', async () => {
      const searchTerm = 'Client';

      // Test old endpoint (if exists)
      let oldTime = null;
      try {
        const oldStart = Date.now();
        await request(app)
          .get(`/api/clients?search=${searchTerm}`)
          .set('Authorization', `Bearer ${authToken}`);
        oldTime = Date.now() - oldStart;
      } catch (error) {
        oldTime = null;
      }

      // Test new endpoint
      const newStart = Date.now();
      await request(app)
        .get(`/api/v2/clients?search=${searchTerm}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const newTime = Date.now() - newStart;

      console.log(`Old search: ${oldTime}ms, New search: ${newTime}ms`);

      expect(newTime).toBeLessThan(300);

      if (oldTime !== null) {
        expect(newTime).toBeLessThanOrEqual(oldTime * 1.2);
      }
    });
  });

  describe('Memory Usage Comparison', () => {
    test('should not significantly increase memory usage', async () => {
      const initialMemory = process.memoryUsage();

      // Make multiple requests to new endpoints
      for (let i = 0; i < 50; i++) {
        await request(app)
          .get('/api/v2/clients')
          .set('Authorization', `Bearer ${authToken}`);
      }

      const finalMemory = process.memoryUsage();
      const heapIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(heapIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Error Handling Performance', () => {
    test('should handle errors efficiently', async () => {
      const startTime = Date.now();
      
      // Request non-existent resource
      await request(app)
        .get('/api/v2/clients/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      
      const responseTime = Date.now() - startTime;

      // Error responses should be fast
      expect(responseTime).toBeLessThan(100);
    });

    test('should handle validation errors efficiently', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Invalid
          email: 'invalid-email' // Invalid
        })
        .expect(400);
      
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(150);
    });
  });

  describe('Transaction Performance', () => {
    test('should handle transactions efficiently', async () => {
      const database = container.resolve('database');
      
      const startTime = Date.now();
      
      await database.transaction(async (client) => {
        // Insert client
        const clientResult = await client.queryOne(
          'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
          [testUserId, 'Transaction Test Client', 'transaction@example.com']
        );

        // Insert project
        await client.queryOne(
          'INSERT INTO projects (user_id, client_id, name, status) VALUES ($1, $2, $3, $4) RETURNING id',
          [testUserId, clientResult.id, 'Transaction Test Project', 'active']
        );

        // Rollback by throwing error
        throw new Error('Intentional rollback');
      }).catch(() => {
        // Expected to fail
      });
      
      const transactionTime = Date.now() - startTime;

      // Transaction with rollback should be fast
      expect(transactionTime).toBeLessThan(200);

      // Verify rollback worked
      const client = await database.queryOne(
        'SELECT * FROM clients WHERE email = $1',
        ['transaction@example.com']
      );
      expect(client).toBeNull();
    });
  });
});
