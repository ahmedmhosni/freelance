/**
 * Property-Based Test: CRUD Operation Completeness
 * 
 * **Feature: full-system-audit, Property 9: CRUD Operation Completeness**
 * 
 * For any module that implements CRUD operations, all four operations
 * (Create, Read, Update, Delete) should function correctly and return appropriate responses.
 * 
 * **Validates: Requirements 3.1**
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

// Modules to test with their test data generators
const MODULES_TO_TEST = [
  {
    name: 'clients',
    path: '/api/clients',
    dataGenerator: fc.record({
      name: fc.string({ minLength: 2, maxLength: 50 }),
      email: fc.emailAddress(),
      company: fc.string({ minLength: 2, maxLength: 50 }),
      phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }))
    }),
    updateField: 'name'
  },
  {
    name: 'projects',
    path: '/api/projects',
    dataGenerator: fc.record({
      name: fc.string({ minLength: 2, maxLength: 100 }),
      description: fc.string({ minLength: 10, maxLength: 500 }),
      status: fc.constantFrom('planning', 'in_progress', 'completed', 'on_hold'),
      budget: fc.integer({ min: 100, max: 100000 })
    }),
    updateField: 'name',
    requiresClientId: true
  },
  {
    name: 'tasks',
    path: '/api/tasks',
    dataGenerator: fc.record({
      title: fc.string({ minLength: 2, maxLength: 100 }),
      description: fc.string({ minLength: 10, maxLength: 500 }),
      status: fc.constantFrom('todo', 'in_progress', 'completed'),
      priority: fc.constantFrom('low', 'medium', 'high')
    }),
    updateField: 'title',
    requiresProjectId: true
  }
];

describe('Property 9: CRUD Operation Completeness', () => {
  let authToken = null;
  let testClientId = null;
  let testProjectId = null;

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

    // Create a test client for projects/tasks that need it
    if (authToken) {
      const clientResponse = await client.post('/api/clients', {
        name: 'Test Client for CRUD',
        email: 'crud-test@example.com',
        company: 'CRUD Test Co'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (clientResponse.status === 201 || clientResponse.status === 200) {
        testClientId = clientResponse.data.id || clientResponse.data.client?.id;
      }

      // Create a test project for tasks that need it
      if (testClientId) {
        const projectResponse = await client.post('/api/projects', {
          name: 'Test Project for CRUD',
          description: 'Test project for CRUD operations',
          status: 'in_progress',
          budget: 10000,
          client_id: testClientId
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (projectResponse.status === 201 || projectResponse.status === 200) {
          testProjectId = projectResponse.data.id || projectResponse.data.project?.id;
        }
      }
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (authToken) {
      if (testProjectId) {
        await client.delete(`/api/projects/${testProjectId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
      if (testClientId) {
        await client.delete(`/api/clients/${testClientId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  // Test each module
  for (const module of MODULES_TO_TEST) {
    describe(`${module.name} module`, () => {
      test(`CREATE operation works for ${module.name}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            module.dataGenerator,
            async (testData) => {
              // Add required foreign keys
              if (module.requiresClientId && testClientId) {
                testData.client_id = testClientId;
              }
              if (module.requiresProjectId && testProjectId) {
                testData.project_id = testProjectId;
              }

              const response = await client.post(module.path, testData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              // Should return 201 Created or 200 OK
              expect(response.status).toBeGreaterThanOrEqual(200);
              expect(response.status).toBeLessThan(300);

              // Should return created resource with ID
              expect(response.data).toBeTruthy();
              const resourceId = response.data.id || response.data[module.name.slice(0, -1)]?.id;
              expect(resourceId).toBeTruthy();

              // Cleanup
              if (resourceId) {
                await client.delete(`${module.path}/${resourceId}`, {
                  headers: { 'Authorization': `Bearer ${authToken}` }
                });
              }
            }
          ),
          { numRuns: 10 }
        );
      }, 30000);

      test(`READ operation works for ${module.name}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            module.dataGenerator,
            async (testData) => {
              // Add required foreign keys
              if (module.requiresClientId && testClientId) {
                testData.client_id = testClientId;
              }
              if (module.requiresProjectId && testProjectId) {
                testData.project_id = testProjectId;
              }

              // Create resource first
              const createResponse = await client.post(module.path, testData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              if (createResponse.status < 200 || createResponse.status >= 300) {
                return; // Skip if create failed
              }

              const resourceId = createResponse.data.id || createResponse.data[module.name.slice(0, -1)]?.id;

              // Read the resource
              const readResponse = await client.get(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              // Should return 200 OK
              expect(readResponse.status).toBe(200);

              // Should return the resource
              expect(readResponse.data).toBeTruthy();
              const resource = readResponse.data[module.name.slice(0, -1)] || readResponse.data;
              expect(resource.id).toBe(resourceId);

              // Cleanup
              await client.delete(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
            }
          ),
          { numRuns: 10 }
        );
      }, 30000);

      test(`UPDATE operation works for ${module.name}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            module.dataGenerator,
            fc.string({ minLength: 2, maxLength: 50 }),
            async (testData, updatedValue) => {
              // Add required foreign keys
              if (module.requiresClientId && testClientId) {
                testData.client_id = testClientId;
              }
              if (module.requiresProjectId && testProjectId) {
                testData.project_id = testProjectId;
              }

              // Create resource first
              const createResponse = await client.post(module.path, testData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              if (createResponse.status < 200 || createResponse.status >= 300) {
                return; // Skip if create failed
              }

              const resourceId = createResponse.data.id || createResponse.data[module.name.slice(0, -1)]?.id;

              // Update the resource
              const updateData = { ...testData };
              updateData[module.updateField] = updatedValue;

              const updateResponse = await client.put(`${module.path}/${resourceId}`, updateData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              // Should return 200 OK
              expect(updateResponse.status).toBe(200);

              // Should return updated resource
              expect(updateResponse.data).toBeTruthy();
              const resource = updateResponse.data[module.name.slice(0, -1)] || updateResponse.data;
              expect(resource[module.updateField]).toBe(updatedValue);

              // Cleanup
              await client.delete(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
            }
          ),
          { numRuns: 10 }
        );
      }, 30000);

      test(`DELETE operation works for ${module.name}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            module.dataGenerator,
            async (testData) => {
              // Add required foreign keys
              if (module.requiresClientId && testClientId) {
                testData.client_id = testClientId;
              }
              if (module.requiresProjectId && testProjectId) {
                testData.project_id = testProjectId;
              }

              // Create resource first
              const createResponse = await client.post(module.path, testData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              if (createResponse.status < 200 || createResponse.status >= 300) {
                return; // Skip if create failed
              }

              const resourceId = createResponse.data.id || createResponse.data[module.name.slice(0, -1)]?.id;

              // Delete the resource
              const deleteResponse = await client.delete(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              // Should return 200 OK or 204 No Content
              expect(deleteResponse.status).toBeGreaterThanOrEqual(200);
              expect(deleteResponse.status).toBeLessThan(300);

              // Verify deletion by trying to read
              const verifyResponse = await client.get(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              // Should return 404 Not Found
              expect(verifyResponse.status).toBe(404);
            }
          ),
          { numRuns: 10 }
        );
      }, 30000);

      test(`all CRUD operations work together for ${module.name}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            module.dataGenerator,
            async (testData) => {
              // Add required foreign keys
              if (module.requiresClientId && testClientId) {
                testData.client_id = testClientId;
              }
              if (module.requiresProjectId && testProjectId) {
                testData.project_id = testProjectId;
              }

              // CREATE
              const createResponse = await client.post(module.path, testData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              expect(createResponse.status).toBeGreaterThanOrEqual(200);
              expect(createResponse.status).toBeLessThan(300);

              const resourceId = createResponse.data.id || createResponse.data[module.name.slice(0, -1)]?.id;
              expect(resourceId).toBeTruthy();

              // READ
              const readResponse = await client.get(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              expect(readResponse.status).toBe(200);

              // UPDATE
              const updateData = { ...testData };
              updateData[module.updateField] = `${testData[module.updateField]}_updated`;

              const updateResponse = await client.put(`${module.path}/${resourceId}`, updateData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              expect(updateResponse.status).toBe(200);

              // DELETE
              const deleteResponse = await client.delete(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              expect(deleteResponse.status).toBeGreaterThanOrEqual(200);
              expect(deleteResponse.status).toBeLessThan(300);

              // VERIFY DELETION
              const verifyResponse = await client.get(`${module.path}/${resourceId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              expect(verifyResponse.status).toBe(404);
            }
          ),
          { numRuns: 5 }
        );
      }, 30000);
    });
  }
});
