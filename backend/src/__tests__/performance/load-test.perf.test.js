const request = require('supertest');
const { bootstrap } = require('../../core/bootstrap');

describe('Performance: Load Testing', () => {
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
        email: 'perf-test@example.com',
        password: 'PerfTest123!',
        name: 'Performance Test User'
      });

    authToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    const database = container.resolve('database');
    await database.execute('DELETE FROM users WHERE id = $1', [testUserId]);
    await database.close();
  });

  describe('Endpoint Response Times', () => {
    test('GET /api/v2/clients should respond within 200ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });

    test('POST /api/v2/clients should respond within 300ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Performance Test Client',
          email: 'perf@example.com'
        })
        .expect(201);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(300);

      // Cleanup
      const database = container.resolve('database');
      await database.execute('DELETE FROM clients WHERE id = $1', [response.body.id]);
    });

    test('GET /api/v2/dashboard should respond within 500ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v2/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle 10 concurrent GET requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v2/clients')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000);
    });

    test('should handle 5 concurrent POST requests', async () => {
      const requests = Array(5).fill(null).map((_, index) =>
        request(app)
          .post('/api/v2/clients')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Concurrent Client ${index}`,
            email: `concurrent${index}@example.com`
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(3000);

      // Cleanup
      const database = container.resolve('database');
      for (const response of responses) {
        await database.execute('DELETE FROM clients WHERE id = $1', [response.body.id]);
      }
    });
  });

  describe('Pagination Performance', () => {
    let clientIds = [];

    beforeAll(async () => {
      // Create 50 test clients
      const database = container.resolve('database');
      for (let i = 0; i < 50; i++) {
        const result = await database.queryOne(
          'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
          [testUserId, `Pagination Client ${i}`, `pagination${i}@example.com`]
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

    test('should paginate efficiently with limit and offset', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v2/clients?limit=10&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;

      expect(response.body.length).toBeLessThanOrEqual(10);
      expect(responseTime).toBeLessThan(200);
    });

    test('should handle large offset efficiently', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v2/clients?limit=10&offset=40')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(250);
    });
  });

  describe('Search Performance', () => {
    let clientIds = [];

    beforeAll(async () => {
      // Create test clients with searchable data
      const database = container.resolve('database');
      const names = ['Apple Corp', 'Banana Inc', 'Cherry LLC', 'Date Systems', 'Elderberry Tech'];
      
      for (const name of names) {
        const result = await database.queryOne(
          'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
          [testUserId, name, `${name.toLowerCase().replace(' ', '')}@example.com`]
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

    test('should search efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v2/clients?search=Corp')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;

      expect(response.body.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(250);
    });

    test('should handle wildcard searches efficiently', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v2/clients?search=e')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(300);
    });
  });

  describe('Complex Query Performance', () => {
    test('should handle dashboard aggregations efficiently', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v2/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });

    test('should handle report generation efficiently', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const startTime = Date.now();
      
      await request(app)
        .get(`/api/v2/reports/time-tracking?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Database Connection Pool Performance', () => {
    test('should handle rapid sequential requests', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        await request(app)
          .get('/api/v2/clients')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 20;

      expect(avgTime).toBeLessThan(150);
    });

    test('should maintain connection pool under load', async () => {
      const database = container.resolve('database');
      const initialStats = database.getPoolStats();

      // Make multiple concurrent requests
      const requests = Array(15).fill(null).map(() =>
        request(app)
          .get('/api/v2/clients')
          .set('Authorization', `Bearer ${authToken}`)
      );

      await Promise.all(requests);

      const finalStats = database.getPoolStats();

      // Pool should not be exhausted
      expect(finalStats.idle).toBeGreaterThan(0);
      expect(finalStats.waiting).toBe(0);
    });
  });
});
