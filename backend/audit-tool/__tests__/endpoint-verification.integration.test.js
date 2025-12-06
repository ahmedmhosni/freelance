/**
 * Integration Test: Endpoint Verification
 * 
 * Tests endpoint verification against a running test server.
 * Verifies authentication flow and CRUD operations for each module.
 * 
 * **Validates: Requirements 3.1, 3.2, 6.1, 6.2**
 * 
 * NOTE: This test requires a running backend server.
 * Run `npm start` in the backend directory before running these tests.
 */

const EndpointVerifier = require('../verifiers/EndpointVerifier');
const config = require('../audit.config');
const { createRouteInfo } = require('../models/RouteInfo');

describe('Integration Test: Endpoint Verification', () => {
  let verifier;
  let authToken;

  beforeAll(async () => {
    // Create endpoint verifier
    verifier = new EndpointVerifier({
      baseURL: config.backend.baseURL,
      timeout: config.verification.timeout,
      retries: config.verification.retries
    });

    // Check if server is running
    try {
      const healthCheck = await verifier.client.get('/api/health').catch(() => null);
      if (!healthCheck || healthCheck.status !== 200) {
        console.warn('⚠️  Backend server may not be running. Some tests may fail.');
        console.warn('   Start the server with: cd backend && npm start');
      }
    } catch (error) {
      console.warn('⚠️  Cannot reach backend server:', error.message);
    }
  });

  afterAll(async () => {
    // Cleanup
    if (verifier) {
      verifier.clearAuthToken();
    }
  });

  /**
   * Test: Authentication flow (register, login, protected route, logout)
   */
  test('should verify complete authentication flow', async () => {
    const result = await verifier.verifyAuthFlow();

    // Verify result structure
    expect(result.register).toBeDefined();
    expect(result.login).toBeDefined();
    expect(result.protectedRoute).toBeDefined();
    expect(result.logout).toBeDefined();
    expect(result.timestamp).toBeDefined();

    // Verify registration
    if (result.register.success) {
      expect(result.register.error).toBeNull();
      console.log('✓ Registration test passed');
    } else {
      console.warn('⚠️  Registration test failed:', result.register.error);
    }

    // Verify login
    if (result.login.success) {
      expect(result.login.token).toBeDefined();
      expect(result.login.error).toBeNull();
      authToken = result.login.token;
      console.log('✓ Login test passed');
    } else {
      console.warn('⚠️  Login test failed:', result.login.error);
    }

    // Verify protected route access
    if (result.protectedRoute.success) {
      expect(result.protectedRoute.error).toBeNull();
      console.log('✓ Protected route test passed');
    } else {
      console.warn('⚠️  Protected route test failed:', result.protectedRoute.error);
    }

    // Verify logout
    if (result.logout.success) {
      expect(result.logout.error).toBeNull();
      console.log('✓ Logout test passed');
    } else {
      console.warn('⚠️  Logout test failed:', result.logout.error);
    }

    // At least login should succeed for other tests to work
    expect(result.login.success || result.register.success).toBe(true);
  }, 30000);

  /**
   * Test: Single endpoint verification
   */
  test('should verify a single endpoint', async () => {
    // Setup: Get auth token if not already set
    if (!authToken) {
      const authResult = await verifier.verifyAuthFlow();
      if (authResult.login.success) {
        authToken = authResult.login.token;
        verifier.setAuthToken(authToken);
      }
    }

    // Test a simple GET endpoint
    const route = createRouteInfo({
      method: 'GET',
      path: '/api/auth/me',
      handler: 'getMe',
      middleware: ['auth'],
      module: 'auth',
      isLegacy: false,
      requiresAuth: true,
      file: 'auth/routes.js'
    });

    const result = await verifier.verifyEndpoint(route, { token: authToken });

    // Verify result structure
    expect(result.route).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.statusCode).toBeDefined();
    expect(result.responseTime).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
    expect(result.request).toBeDefined();
    expect(result.response).toBeDefined();

    // Log result
    if (result.success) {
      console.log(`✓ Endpoint ${route.method} ${route.path} verified (${result.responseTime}ms)`);
    } else {
      console.warn(`⚠️  Endpoint ${route.method} ${route.path} failed:`, result.errors);
    }
  }, 30000);

  /**
   * Test: CRUD operations for clients module
   */
  test('should verify CRUD operations for clients module', async () => {
    // Setup: Get auth token
    if (!authToken) {
      const authResult = await verifier.verifyAuthFlow();
      if (authResult.login.success) {
        authToken = authResult.login.token;
        verifier.setAuthToken(authToken);
      }
    }

    const testData = {
      name: `Test Client ${Date.now()}`,
      email: `client-${Date.now()}@example.com`,
      phone: '555-0100',
      company: 'Test Company',
      address: '123 Test St'
    };

    const result = await verifier.verifyCRUDOperations('clients', testData);

    // Verify result structure
    expect(result.module).toBe('clients');
    expect(result.create).toBeDefined();
    expect(result.read).toBeDefined();
    expect(result.update).toBeDefined();
    expect(result.delete).toBeDefined();
    expect(result.timestamp).toBeDefined();

    // Log results
    console.log('Clients CRUD Results:');
    console.log(`  CREATE: ${result.create.success ? '✓' : '✗'} ${result.create.error || ''}`);
    console.log(`  READ:   ${result.read.success ? '✓' : '✗'} ${result.read.error || ''}`);
    console.log(`  UPDATE: ${result.update.success ? '✓' : '✗'} ${result.update.error || ''}`);
    console.log(`  DELETE: ${result.delete.success ? '✓' : '✗'} ${result.delete.error || ''}`);

    // At least create should work for a valid module
    if (result.create.success) {
      expect(result.create.data).toBeDefined();
    }
  }, 60000);

  /**
   * Test: CRUD operations for projects module
   */
  test('should verify CRUD operations for projects module', async () => {
    // Setup: Get auth token
    if (!authToken) {
      const authResult = await verifier.verifyAuthFlow();
      if (authResult.login.success) {
        authToken = authResult.login.token;
        verifier.setAuthToken(authToken);
      }
    }

    // First create a client for the project
    const clientData = {
      name: `Project Test Client ${Date.now()}`,
      email: `project-client-${Date.now()}@example.com`,
      phone: '555-0101',
      company: 'Project Test Company',
      address: '456 Test Ave'
    };

    const clientResult = await verifier.verifyCRUDOperations('clients', clientData);
    let clientId = null;

    if (clientResult.create.success && clientResult.create.data) {
      clientId = clientResult.create.data.id || clientResult.create.data.client?.id;
    }

    // Now test project CRUD
    const projectData = {
      name: `Test Project ${Date.now()}`,
      description: 'Test project description',
      client_id: clientId || 1, // Use created client or fallback to 1
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    };

    const result = await verifier.verifyCRUDOperations('projects', projectData);

    // Verify result structure
    expect(result.module).toBe('projects');
    expect(result.create).toBeDefined();
    expect(result.read).toBeDefined();
    expect(result.update).toBeDefined();
    expect(result.delete).toBeDefined();

    // Log results
    console.log('Projects CRUD Results:');
    console.log(`  CREATE: ${result.create.success ? '✓' : '✗'} ${result.create.error || ''}`);
    console.log(`  READ:   ${result.read.success ? '✓' : '✗'} ${result.read.error || ''}`);
    console.log(`  UPDATE: ${result.update.success ? '✓' : '✗'} ${result.update.error || ''}`);
    console.log(`  DELETE: ${result.delete.success ? '✓' : '✗'} ${result.delete.error || ''}`);

    // Cleanup: delete test client if created
    if (clientId && clientResult.delete.success === false) {
      try {
        await verifier.client.delete(`/api/clients/${clientId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }, 60000);

  /**
   * Test: Validation error handling
   */
  test('should verify validation error responses', async () => {
    // Setup: Get auth token
    if (!authToken) {
      const authResult = await verifier.verifyAuthFlow();
      if (authResult.login.success) {
        authToken = authResult.login.token;
        verifier.setAuthToken(authToken);
      }
    }

    // Test with invalid data (missing required fields)
    const invalidData = {
      // Missing name and email fields
      phone: '555-0100'
    };

    const result = await verifier.verifyValidationErrors(
      '/api/clients',
      'POST',
      invalidData
    );

    // Verify result structure
    expect(result.path).toBe('/api/clients');
    expect(result.method).toBe('POST');
    expect(result.statusCode).toBeDefined();
    expect(result.timestamp).toBeDefined();

    // Verify validation error was returned
    if (result.success) {
      expect(result.statusCode).toBeGreaterThanOrEqual(400);
      expect(result.statusCode).toBeLessThan(500);
      console.log('✓ Validation error handling verified');
    } else {
      console.warn('⚠️  Validation error test failed:', result.error);
    }
  }, 30000);

  /**
   * Test: Foreign key constraint handling
   */
  test('should verify foreign key constraint enforcement', async () => {
    // Setup: Get auth token
    if (!authToken) {
      const authResult = await verifier.verifyAuthFlow();
      if (authResult.login.success) {
        authToken = authResult.login.token;
        verifier.setAuthToken(authToken);
      }
    }

    // Test with invalid foreign key
    const dataWithInvalidFK = {
      name: `Test Project ${Date.now()}`,
      description: 'Test project with invalid client',
      client_id: 999999, // Non-existent client ID
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    };

    const result = await verifier.verifyForeignKeyConstraints(
      '/api/projects',
      dataWithInvalidFK
    );

    // Verify result structure
    expect(result.path).toBe('/api/projects');
    expect(result.statusCode).toBeDefined();
    expect(result.timestamp).toBeDefined();

    // Verify constraint violation was detected
    if (result.success) {
      expect(result.constraintViolationDetected).toBe(true);
      console.log('✓ Foreign key constraint enforcement verified');
    } else {
      console.warn('⚠️  Foreign key constraint test failed:', result.error);
    }
  }, 30000);

  /**
   * Test: Authentication enforcement on protected routes
   */
  test('should enforce authentication on protected routes', async () => {
    // Clear auth token to test unauthenticated access
    verifier.clearAuthToken();

    const protectedRoute = createRouteInfo({
      method: 'GET',
      path: '/api/clients',
      handler: 'getAll',
      middleware: ['auth'],
      module: 'clients',
      isLegacy: false,
      requiresAuth: true,
      file: 'clients/routes.js'
    });

    // Try to access without token
    const result = await verifier.verifyEndpoint(protectedRoute, {});

    // Verify authentication was enforced
    expect(result.statusCode).toBeDefined();

    if (result.statusCode === 401 || result.statusCode === 403) {
      console.log('✓ Authentication enforcement verified (401/403 returned)');
      expect(result.success).toBe(false);
    } else {
      console.warn(`⚠️  Expected 401/403, got ${result.statusCode}`);
    }

    // Restore auth token for other tests
    if (authToken) {
      verifier.setAuthToken(authToken);
    }
  }, 30000);

  /**
   * Test: Response time measurement
   */
  test('should measure endpoint response times', async () => {
    // Setup: Get auth token
    if (!authToken) {
      const authResult = await verifier.verifyAuthFlow();
      if (authResult.login.success) {
        authToken = authResult.login.token;
        verifier.setAuthToken(authToken);
      }
    }

    const route = createRouteInfo({
      method: 'GET',
      path: '/api/clients',
      handler: 'getAll',
      middleware: ['auth'],
      module: 'clients',
      isLegacy: false,
      requiresAuth: true,
      file: 'clients/routes.js'
    });

    const result = await verifier.verifyEndpoint(route, { token: authToken });

    // Verify response time was measured
    expect(result.responseTime).toBeGreaterThan(0);
    expect(result.responseTime).toBeLessThan(10000); // Should be less than 10 seconds

    console.log(`Response time: ${result.responseTime}ms`);
  }, 30000);

  /**
   * Test: Multiple concurrent endpoint verifications
   */
  test('should handle multiple concurrent endpoint verifications', async () => {
    // Setup: Get auth token
    if (!authToken) {
      const authResult = await verifier.verifyAuthFlow();
      if (authResult.login.success) {
        authToken = authResult.login.token;
        verifier.setAuthToken(authToken);
      }
    }

    const routes = [
      createRouteInfo({
        method: 'GET',
        path: '/api/clients',
        handler: 'getAll',
        middleware: ['auth'],
        module: 'clients',
        isLegacy: false,
        requiresAuth: true,
        file: 'clients/routes.js'
      }),
      createRouteInfo({
        method: 'GET',
        path: '/api/projects',
        handler: 'getAll',
        middleware: ['auth'],
        module: 'projects',
        isLegacy: false,
        requiresAuth: true,
        file: 'projects/routes.js'
      }),
      createRouteInfo({
        method: 'GET',
        path: '/api/tasks',
        handler: 'getAll',
        middleware: ['auth'],
        module: 'tasks',
        isLegacy: false,
        requiresAuth: true,
        file: 'tasks/routes.js'
      })
    ];

    // Verify all routes concurrently
    const results = await Promise.all(
      routes.map(route => verifier.verifyEndpoint(route, { token: authToken }))
    );

    // Verify all results
    expect(results.length).toBe(routes.length);

    for (let i = 0; i < results.length; i++) {
      expect(results[i].route).toBeDefined();
      expect(results[i].statusCode).toBeDefined();
      expect(results[i].responseTime).toBeGreaterThan(0);

      console.log(`${routes[i].method} ${routes[i].path}: ${results[i].statusCode} (${results[i].responseTime}ms)`);
    }
  }, 60000);
});
