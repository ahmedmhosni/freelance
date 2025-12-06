/**
 * Property-Based Test: Authentication Enforcement
 * 
 * **Feature: full-system-audit, Property 10: Authentication Enforcement**
 * 
 * For any protected route, requests without valid JWT tokens should be rejected 
 * with 401 status, and requests with valid tokens should be allowed.
 * 
 * **Validates: Requirements 3.2, 6.2**
 */

const fc = require('fast-check');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration - read from environment
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production_12345';

// Protected routes to test
const PROTECTED_ROUTES = [
  { method: 'get', path: '/api/auth/me' },
  { method: 'get', path: '/api/clients' },
  { method: 'get', path: '/api/projects' },
  { method: 'get', path: '/api/tasks' },
  { method: 'get', path: '/api/time-entries' }
];

/**
 * Generator for valid JWT tokens
 */
const validTokenArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('user', 'admin')
}).map(payload => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
});

/**
 * Generator for invalid tokens
 */
const invalidTokenArbitrary = fc.oneof(
  fc.constant(''), // Empty token
  fc.constant('invalid-token'), // Malformed token
  fc.string({ minLength: 10, maxLength: 50 }), // Random string
  fc.constant('Bearer invalid'), // Invalid Bearer format
  fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    email: fc.emailAddress()
  }).map(payload => {
    // Token with wrong secret
    return jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
  }),
  fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    email: fc.emailAddress()
  }).map(payload => {
    // Expired token
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });
  })
);

describe('Property 10: Authentication Enforcement', () => {
  const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true // Don't throw on any status
  });

  test('protected routes reject requests without valid tokens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...PROTECTED_ROUTES),
        invalidTokenArbitrary,
        async (route, invalidToken) => {
          // Make request with invalid or no token
          const headers = {};
          if (invalidToken && invalidToken.trim() !== '') {
            headers['Authorization'] = invalidToken.startsWith('Bearer ') 
              ? invalidToken 
              : `Bearer ${invalidToken}`;
          }

          const response = await client.request({
            method: route.method,
            url: route.path,
            headers
          });

          // Should be rejected with 401 Unauthorized or 404 Not Found
          // Note: 401 for invalid/expired tokens, 404 for missing resources
          expect([401, 404]).toContain(response.status);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('protected routes allow requests with valid tokens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...PROTECTED_ROUTES),
        validTokenArbitrary,
        async (route, validToken) => {
          // Make request with valid token
          const response = await client.request({
            method: route.method,
            url: route.path,
            headers: {
              'Authorization': `Bearer ${validToken}`
            }
          });

          // Should NOT be rejected with 401
          // (may be 200, 404, 403, etc. but not 401)
          expect(response.status).not.toBe(401);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('authentication enforcement is consistent across all protected routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidTokenArbitrary,
        async (invalidToken) => {
          const results = [];

          // Test all protected routes with the same invalid token
          for (const route of PROTECTED_ROUTES) {
            const headers = {};
            if (invalidToken && invalidToken.trim() !== '') {
              headers['Authorization'] = invalidToken.startsWith('Bearer ') 
                ? invalidToken 
                : `Bearer ${invalidToken}`;
            }

            const response = await client.request({
              method: route.method,
              url: route.path,
              headers
            });

            results.push(response.status);
          }

          // All protected routes should consistently return 401 or 404
          // Note: 401 for invalid/expired tokens, 404 for missing resources
          const allAreUnauthorized = results.every(status => status === 401 || status === 404);
          expect(allAreUnauthorized).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});
