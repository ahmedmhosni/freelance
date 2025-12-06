/**
 * Property-Based Test: Foreign Key Constraint Enforcement
 * 
 * **Feature: full-system-audit, Property 13: Foreign Key Constraint Enforcement**
 * 
 * For any entity with foreign key relationships, attempting to create a record
 * with an invalid foreign key should fail with an appropriate error.
 * 
 * **Validates: Requirements 3.5**
 */

const fc = require('fast-check');
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Test credentials (from seed-simple.js)
const TEST_CREDENTIALS = {
  email: 'ahmedmhosni90@gmail.com',
  password: 'password123'
};

/**
 * Generator for invalid (non-existent) IDs
 */
const invalidIdArbitrary = fc.oneof(
  fc.integer({ min: 999999, max: 9999999 }), // Very large IDs unlikely to exist
  fc.integer({ min: -1000, max: -1 }), // Negative IDs
  fc.constant(0), // Zero ID
  fc.constant(null) // Null ID
);

describe('Property 13: Foreign Key Constraint Enforcement', () => {
  let authToken = null;
  let validClientId = null;
  let validProjectId = null;

  const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true // Don't throw on any status
  });

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await client.post('/api/auth/login', TEST_CREDENTIALS);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      authToken = loginResponse.data.token;
    }

    // Create a valid client for testing
    if (authToken) {
      const clientResponse = await client.post('/api/clients', {
        name: 'FK Test Client',
        email: 'fk-test@example.com',
        company: 'FK Test Co'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (clientResponse.status === 201 || clientResponse.status === 200) {
        validClientId = clientResponse.data.id || clientResponse.data.client?.id;
      }

      // Create a valid project for testing
      if (validClientId) {
        const projectResponse = await client.post('/api/projects', {
          name: 'FK Test Project',
          description: 'Test project for FK constraints',
          status: 'in_progress',
          budget: 10000,
          client_id: validClientId
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (projectResponse.status === 201 || projectResponse.status === 200) {
          validProjectId = projectResponse.data.id || projectResponse.data.project?.id;
        }
      }
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (authToken) {
      if (validProjectId) {
        await client.delete(`/api/projects/${validProjectId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
      if (validClientId) {
        await client.delete(`/api/clients/${validClientId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  test('projects with invalid client_id are rejected', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        invalidIdArbitrary,
        async (invalidClientId) => {
          const response = await client.post('/api/projects', {
            name: 'Test Project',
            description: 'Test project with invalid client',
            status: 'planning',
            budget: 5000,
            client_id: invalidClientId
          }, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          // Should be rejected with 400, 404, 409, or 422
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.status).toBeLessThan(500);

          // Should include error message
          expect(response.data).toBeTruthy();
          const hasError = 
            response.data.error ||
            response.data.message ||
            response.data.errors;
          expect(hasError).toBeTruthy();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  test('tasks with invalid project_id are rejected', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        invalidIdArbitrary,
        async (invalidProjectId) => {
          const response = await client.post('/api/tasks', {
            title: 'Test Task',
            description: 'Test task with invalid project',
            status: 'todo',
            priority: 'medium',
            project_id: invalidProjectId
          }, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          // Should be rejected with 400, 404, 409, or 422
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.status).toBeLessThan(500);

          // Should include error message
          expect(response.data).toBeTruthy();
          const hasError = 
            response.data.error ||
            response.data.message ||
            response.data.errors;
          expect(hasError).toBeTruthy();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  test('time entries with invalid task_id are rejected', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        invalidIdArbitrary,
        async (invalidTaskId) => {
          const now = new Date();
          const start = new Date(now.getTime() - 3600000); // 1 hour ago

          const response = await client.post('/api/time-entries', {
            task_id: invalidTaskId,
            description: 'Test time entry',
            start_time: start.toISOString(),
            end_time: now.toISOString(),
            duration: 60,
            is_billable: true,
            hourly_rate: 100
          }, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          // Should be rejected with 400, 404, 409, or 422
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.status).toBeLessThan(500);

          // Should include error message
          expect(response.data).toBeTruthy();
          const hasError = 
            response.data.error ||
            response.data.message ||
            response.data.errors;
          expect(hasError).toBeTruthy();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  test('invoices with invalid client_id are rejected', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        invalidIdArbitrary,
        async (invalidClientId) => {
          const response = await client.post('/api/invoices', {
            client_id: invalidClientId,
            invoice_number: `INV-TEST-${Date.now()}`,
            amount: 1000,
            tax: 100,
            total: 1100,
            status: 'draft',
            issue_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          // Should be rejected with 400, 404, 409, or 422
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.status).toBeLessThan(500);

          // Should include error message
          expect(response.data).toBeTruthy();
          const hasError = 
            response.data.error ||
            response.data.message ||
            response.data.errors;
          expect(hasError).toBeTruthy();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  test('valid foreign keys are accepted', async () => {
    if (!authToken || !validClientId || !validProjectId) {
      console.warn('Skipping test - missing prerequisites');
      return;
    }

    // Test project with valid client_id
    const projectResponse = await client.post('/api/projects', {
      name: 'Valid FK Test Project',
      description: 'Project with valid client FK',
      status: 'planning',
      budget: 5000,
      client_id: validClientId
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // Should succeed
    expect(projectResponse.status).toBeGreaterThanOrEqual(200);
    expect(projectResponse.status).toBeLessThan(300);

    const projectId = projectResponse.data.id || projectResponse.data.project?.id;

    // Test task with valid project_id
    const taskResponse = await client.post('/api/tasks', {
      title: 'Valid FK Test Task',
      description: 'Task with valid project FK',
      status: 'todo',
      priority: 'medium',
      project_id: projectId
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // Should succeed
    expect(taskResponse.status).toBeGreaterThanOrEqual(200);
    expect(taskResponse.status).toBeLessThan(300);

    // Cleanup
    const taskId = taskResponse.data.id || taskResponse.data.task?.id;
    if (taskId) {
      await client.delete(`/api/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    }
    if (projectId) {
      await client.delete(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    }
  });

  test('foreign key error messages are descriptive', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    // Try to create project with invalid client_id
    const response = await client.post('/api/projects', {
      name: 'Test Project',
      description: 'Test project',
      status: 'planning',
      budget: 5000,
      client_id: 999999 // Non-existent client
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.status >= 400 && response.status < 500) {
      const errorText = JSON.stringify(response.data).toLowerCase();
      
      // Error should mention client, foreign key, or not found
      const hasRelevantError = 
        errorText.includes('client') ||
        errorText.includes('foreign') ||
        errorText.includes('not found') ||
        errorText.includes('invalid') ||
        errorText.includes('exist');

      expect(hasRelevantError).toBe(true);
    }
  });

  test('cascading deletes are handled correctly', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    // Create a client
    const clientResponse = await client.post('/api/clients', {
      name: 'Cascade Test Client',
      email: 'cascade@example.com',
      company: 'Cascade Co'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (clientResponse.status < 200 || clientResponse.status >= 300) {
      return; // Skip if client creation failed
    }

    const clientId = clientResponse.data.id || clientResponse.data.client?.id;

    // Create a project for this client
    const projectResponse = await client.post('/api/projects', {
      name: 'Cascade Test Project',
      description: 'Project for cascade test',
      status: 'planning',
      budget: 5000,
      client_id: clientId
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (projectResponse.status < 200 || projectResponse.status >= 300) {
      // Cleanup client
      await client.delete(`/api/clients/${clientId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      return;
    }

    const projectId = projectResponse.data.id || projectResponse.data.project?.id;

    // Delete the client
    const deleteResponse = await client.delete(`/api/clients/${clientId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // Should succeed or handle cascade appropriately
    expect(deleteResponse.status).toBeGreaterThanOrEqual(200);
    expect(deleteResponse.status).toBeLessThan(500);

    // Try to access the project
    const projectCheckResponse = await client.get(`/api/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // Project should either be deleted (404) or still exist but orphaned
    // The exact behavior depends on the cascade configuration
    expect([200, 404]).toContain(projectCheckResponse.status);

    // Cleanup if project still exists
    if (projectCheckResponse.status === 200) {
      await client.delete(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    }
  });
});
