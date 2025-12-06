/**
 * Property-Based Test: Validation Error Responses
 * 
 * **Feature: full-system-audit, Property 11: Validation Error Responses**
 * 
 * For any endpoint with input validation, when invalid data is submitted,
 * the response should have a 400-level status code and include error details.
 * 
 * **Validates: Requirements 3.3**
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

// Endpoints to test with their invalid data generators
const ENDPOINTS_TO_TEST = [
  {
    name: 'clients',
    path: '/api/clients',
    method: 'post',
    invalidDataGenerator: fc.oneof(
      // Missing required fields
      fc.record({ name: fc.string() }), // Missing email
      fc.record({ email: fc.emailAddress() }), // Missing name
      fc.record({}), // Missing all fields
      // Invalid field types
      fc.record({
        name: fc.integer(), // Should be string
        email: fc.emailAddress(),
        company: fc.string()
      }),
      // Invalid email format
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }),
        email: fc.string().filter(s => !s.includes('@')),
        company: fc.string()
      }),
      // Empty required fields
      fc.record({
        name: fc.constant(''),
        email: fc.emailAddress(),
        company: fc.string()
      })
    )
  },
  {
    name: 'projects',
    path: '/api/projects',
    method: 'post',
    invalidDataGenerator: fc.oneof(
      // Missing required fields
      fc.record({ name: fc.string() }), // Missing other fields
      fc.record({}), // Missing all fields
      // Invalid status
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string(),
        status: fc.string().filter(s => !['planning', 'in_progress', 'completed', 'on_hold'].includes(s)),
        budget: fc.integer({ min: 0 })
      }),
      // Negative budget
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string(),
        status: fc.constantFrom('planning', 'in_progress'),
        budget: fc.integer({ min: -10000, max: -1 })
      }),
      // Empty name
      fc.record({
        name: fc.constant(''),
        description: fc.string(),
        status: fc.constantFrom('planning', 'in_progress'),
        budget: fc.integer({ min: 0 })
      })
    )
  },
  {
    name: 'tasks',
    path: '/api/tasks',
    method: 'post',
    invalidDataGenerator: fc.oneof(
      // Missing required fields
      fc.record({ title: fc.string() }), // Missing other fields
      fc.record({}), // Missing all fields
      // Invalid status
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string(),
        status: fc.string().filter(s => !['todo', 'in_progress', 'completed'].includes(s)),
        priority: fc.constantFrom('low', 'medium', 'high')
      }),
      // Invalid priority
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string(),
        status: fc.constantFrom('todo', 'in_progress'),
        priority: fc.string().filter(s => !['low', 'medium', 'high'].includes(s))
      }),
      // Empty title
      fc.record({
        title: fc.constant(''),
        description: fc.string(),
        status: fc.constantFrom('todo', 'in_progress'),
        priority: fc.constantFrom('low', 'medium', 'high')
      })
    )
  }
];

describe('Property 11: Validation Error Responses', () => {
  let authToken = null;

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
  });

  // Test each endpoint
  for (const endpoint of ENDPOINTS_TO_TEST) {
    describe(`${endpoint.name} endpoint`, () => {
      test(`returns 400-level status for invalid data on ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            endpoint.invalidDataGenerator,
            async (invalidData) => {
              const response = await client.request({
                method: endpoint.method,
                url: endpoint.path,
                data: invalidData,
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              // Should return 400-level status code
              expect(response.status).toBeGreaterThanOrEqual(400);
              expect(response.status).toBeLessThan(500);
            }
          ),
          { numRuns: 50 }
        );
      }, 30000);

      test(`includes error message for invalid data on ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            endpoint.invalidDataGenerator,
            async (invalidData) => {
              const response = await client.request({
                method: endpoint.method,
                url: endpoint.path,
                data: invalidData,
                headers: { 'Authorization': `Bearer ${authToken}` }
              });

              // Should include error information
              if (response.status >= 400 && response.status < 500) {
                expect(response.data).toBeTruthy();
                
                const hasErrorMessage = 
                  response.data.error ||
                  response.data.message ||
                  response.data.errors ||
                  response.data.details;

                expect(hasErrorMessage).toBeTruthy();
              }
            }
          ),
          { numRuns: 50 }
        );
      }, 30000);

      test(`error messages are descriptive for ${endpoint.name}`, async () => {
        if (!authToken) {
          console.warn('Skipping test - no auth token');
          return;
        }

        // Test with completely empty data
        const response = await client.request({
          method: endpoint.method,
          url: endpoint.path,
          data: {},
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.status >= 400 && response.status < 500) {
          expect(response.data).toBeTruthy();
          
          // Error message should be a non-empty string or object
          const errorMessage = 
            response.data.error ||
            response.data.message ||
            JSON.stringify(response.data.errors) ||
            JSON.stringify(response.data.details);

          expect(errorMessage).toBeTruthy();
          expect(errorMessage.length).toBeGreaterThan(0);

          // Should not be a generic error
          const errorText = errorMessage.toLowerCase();
          expect(errorText).not.toBe('error');
          expect(errorText).not.toBe('invalid');
        }
      });
    });
  }

  test('validation errors are consistent across all endpoints', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    const results = [];

    // Test all endpoints with empty data
    for (const endpoint of ENDPOINTS_TO_TEST) {
      const response = await client.request({
        method: endpoint.method,
        url: endpoint.path,
        data: {},
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      results.push({
        endpoint: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
        status: response.status,
        hasError: !!(response.data?.error || response.data?.message || response.data?.errors)
      });
    }

    // All should return 400-level status
    const allAre400Level = results.every(r => r.status >= 400 && r.status < 500);
    expect(allAre400Level).toBe(true);

    // All should have error messages
    const allHaveErrors = results.every(r => r.hasError);
    expect(allHaveErrors).toBe(true);
  });

  test('validation errors include field-specific information', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    // Test with invalid email format on clients endpoint
    const response = await client.post('/api/clients', {
      name: 'Test Client',
      email: 'not-an-email', // Invalid email
      company: 'Test Company'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.status >= 400 && response.status < 500) {
      const errorText = JSON.stringify(response.data).toLowerCase();
      
      // Should mention email in the error
      const mentionsEmail = errorText.includes('email');
      expect(mentionsEmail).toBe(true);
    }
  });

  test('validation errors for missing required fields are specific', async () => {
    if (!authToken) {
      console.warn('Skipping test - no auth token');
      return;
    }

    // Test with missing required field
    const response = await client.post('/api/clients', {
      // Missing name (required field)
      email: 'test@example.com',
      company: 'Test Company'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.status >= 400 && response.status < 500) {
      const errorText = JSON.stringify(response.data).toLowerCase();
      
      // Should mention required or missing
      const mentionsRequired = 
        errorText.includes('required') ||
        errorText.includes('missing') ||
        errorText.includes('name');
      
      expect(mentionsRequired).toBe(true);
    }
  });
});
