const request = require('supertest');
const { bootstrap } = require('../../core/bootstrap');

describe('E2E: Data Consistency and Updates', () => {
  let app;
  let container;
  let authToken;
  let testUserId;
  let clientId;
  let projectId;

  beforeAll(async () => {
    const result = await bootstrap();
    app = result.app;
    container = result.container;

    // Register and login test user
    const registerResponse = await request(app)
      .post('/api/v2/auth/register')
      .send({
        email: 'consistency-test@example.com',
        password: 'ConsistencyTest123!',
        name: 'Consistency Test User'
      });

    authToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    const database = container.resolve('database');
    
    if (projectId) {
      await database.execute('DELETE FROM projects WHERE id = $1', [projectId]);
    }
    if (clientId) {
      await database.execute('DELETE FROM clients WHERE id = $1', [clientId]);
    }
    if (testUserId) {
      await database.execute('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    
    await database.close();
  });

  describe('Concurrent Updates', () => {
    beforeEach(async () => {
      // Create a client for testing
      const response = await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Client',
          email: 'test@example.com'
        });
      
      clientId = response.body.id;
    });

    afterEach(async () => {
      if (clientId) {
        const database = container.resolve('database');
        await database.execute('DELETE FROM clients WHERE id = $1', [clientId]);
        clientId = null;
      }
    });

    test('should handle concurrent updates correctly', async () => {
      // Simulate two concurrent updates
      const update1 = request(app)
        .put(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name 1' });

      const update2 = request(app)
        .put(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name 2' });

      const [response1, response2] = await Promise.all([update1, update2]);

      // Both should succeed
      expect([200, 200]).toContain(response1.status);
      expect([200, 200]).toContain(response2.status);

      // Verify final state
      const finalResponse = await request(app)
        .get(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(['Updated Name 1', 'Updated Name 2']).toContain(finalResponse.body.name);
    });
  });

  describe('Transaction Rollback', () => {
    test('should rollback on validation error', async () => {
      // Create a client
      const clientResponse = await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Rollback Test Client',
          email: 'rollback@example.com'
        });

      clientId = clientResponse.body.id;

      // Try to create a project with invalid data
      const projectResponse = await request(app)
        .post('/api/v2/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientId,
          name: '', // Invalid: empty name
          status: 'active'
        })
        .expect(400);

      expect(projectResponse.body).toHaveProperty('errors');

      // Verify client still exists and is unchanged
      const verifyResponse = await request(app)
        .get(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(verifyResponse.body.name).toBe('Rollback Test Client');
    });
  });

  describe('Cascade Operations', () => {
    beforeEach(async () => {
      // Create client and project
      const clientResponse = await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Cascade Test Client',
          email: 'cascade@example.com'
        });
      
      clientId = clientResponse.body.id;

      const projectResponse = await request(app)
        .post('/api/v2/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientId,
          name: 'Cascade Test Project',
          status: 'active'
        });
      
      projectId = projectResponse.body.id;
    });

    afterEach(async () => {
      const database = container.resolve('database');
      if (projectId) {
        await database.execute('DELETE FROM projects WHERE id = $1', [projectId]);
        projectId = null;
      }
      if (clientId) {
        await database.execute('DELETE FROM clients WHERE id = $1', [clientId]);
        clientId = null;
      }
    });

    test('should update related entities when parent is updated', async () => {
      // Update client
      await request(app)
        .put(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Cascade Client'
        })
        .expect(200);

      // Verify project still references correct client
      const projectResponse = await request(app)
        .get(`/api/v2/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(projectResponse.body.clientId).toBe(clientId);
    });
  });

  describe('Data Validation Across Modules', () => {
    test('should validate cross-module references', async () => {
      // Try to create project with non-existent client
      const response = await request(app)
        .post('/api/v2/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: 99999, // Non-existent
          name: 'Invalid Project',
          status: 'active'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should maintain data consistency across updates', async () => {
      // Create client
      const clientResponse = await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Consistency Client',
          email: 'consistency@example.com'
        });
      
      clientId = clientResponse.body.id;

      // Create project
      const projectResponse = await request(app)
        .post('/api/v2/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientId,
          name: 'Consistency Project',
          status: 'active'
        });
      
      projectId = projectResponse.body.id;

      // Update both
      await request(app)
        .put(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Consistency Client' });

      await request(app)
        .put(`/api/v2/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Consistency Project' });

      // Verify both updates persisted
      const clientCheck = await request(app)
        .get(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const projectCheck = await request(app)
        .get(`/api/v2/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(clientCheck.body.name).toBe('Updated Consistency Client');
      expect(projectCheck.body.name).toBe('Updated Consistency Project');
      expect(projectCheck.body.clientId).toBe(clientId);
    });
  });
});
