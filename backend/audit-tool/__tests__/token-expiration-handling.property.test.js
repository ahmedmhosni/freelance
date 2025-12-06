/**
 * Property-Based Test: Token Expiration Handling
 * 
 * **Feature: full-system-audit, Property 21: Token Expiration Handling**
 * 
 * For any expired JWT token, when used to access a protected route,
 * the request should be rejected with a 401 status code.
 * 
 * **Validates: Requirements 6.3**
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
  { method: 'get', path: '/api/tasks' }
];

/**
 * Generator for expired tokens with various expiration times
 */
const expiredTokenArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('user', 'admin'),
  // Generate tokens that expired between 1 second and 1 year ago
  expiresInSeconds: fc.integer({ min: -31536000, max: -1 })
}).map(({ id, email, role, expiresInSeconds }) => {
  return jwt.sign(
    { id, email, role },
    JWT_SECRET,
    { expiresIn: `${expiresInSeconds}s` }
  );
});

/**
 * Generator for valid (non-expired) tokens
 */
const validTokenArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('user', 'admin'),
  // Generate tokens that expire between 5 seconds and 1 hour from now
  // (minimum 5 seconds to account for request processing time)
  expiresInSeconds: fc.integer({ min: 5, max: 3600 })
}).map(({ id, email, role, expiresInSeconds }) => {
  return jwt.sign(
    { id, email, role },
    JWT_SECRET,
    { expiresIn: `${expiresInSeconds}s` }
  );
});

describe('Property 21: Token Expiration Handling', () => {
  const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true // Don't throw on any status
  });

  test('expired tokens are rejected with 401 status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...PROTECTED_ROUTES),
        expiredTokenArbitrary,
        async (route, expiredToken) => {
          // Verify the token is actually expired
          const decoded = jwt.decode(expiredToken);
          const now = Math.floor(Date.now() / 1000);
          expect(decoded.exp).toBeLessThan(now);

          // Make request with expired token
          const response = await client.request({
            method: route.method,
            url: route.path,
            headers: {
              'Authorization': `Bearer ${expiredToken}`
            }
          });

          // Should be rejected with 401 Unauthorized
          expect(response.status).toBe(401);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('non-expired tokens are not rejected due to expiration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...PROTECTED_ROUTES),
        validTokenArbitrary,
        async (route, validToken) => {
          // Verify the token is not expired
          const decoded = jwt.decode(validToken);
          const now = Math.floor(Date.now() / 1000);
          expect(decoded.exp).toBeGreaterThan(now);

          // Make request with valid token
          const response = await client.request({
            method: route.method,
            url: route.path,
            headers: {
              'Authorization': `Bearer ${validToken}`
            }
          });

          // Should NOT be rejected with 401 due to expiration
          // (may be 200, 404, 403 for other reasons, but not 401 for expiration)
          expect(response.status).not.toBe(401);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('expiration is checked consistently across all protected routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        expiredTokenArbitrary,
        async (expiredToken) => {
          const results = [];

          // Test all protected routes with the same expired token
          for (const route of PROTECTED_ROUTES) {
            const response = await client.request({
              method: route.method,
              url: route.path,
              headers: {
                'Authorization': `Bearer ${expiredToken}`
              }
            });

            results.push({
              route: `${route.method} ${route.path}`,
              status: response.status
            });
          }

          // All protected routes should consistently return 401 for expired tokens
          const allAreUnauthorized = results.every(r => r.status === 401);
          
          if (!allAreUnauthorized) {
            console.log('Inconsistent expiration handling:', results);
          }

          expect(allAreUnauthorized).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  test('tokens expiring at boundary times are handled correctly', async () => {
    // Test token that expires in exactly 1 second
    const almostExpiredToken = jwt.sign(
      { id: 1, email: 'test@example.com', role: 'user' },
      JWT_SECRET,
      { expiresIn: '1s' }
    );

    // Should be valid immediately
    const response1 = await client.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${almostExpiredToken}`
      }
    });

    // Should not be rejected for expiration (may be 403 for other reasons)
    expect(response1.status).not.toBe(401);

    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Should now be rejected
    const response2 = await client.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${almostExpiredToken}`
      }
    });

    // Should be rejected with 401
    expect(response2.status).toBe(401);
  }, 10000);

  test('token expiration error message is descriptive', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { id: 1, email: 'test@example.com', role: 'user' },
      JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const response = await client.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });

    // Should be rejected with 401
    expect(response.status).toBe(401);

    // Should have an error message
    expect(response.data).toBeTruthy();
    
    // Error message should mention expiration or token invalidity
    const errorText = JSON.stringify(response.data).toLowerCase();
    const hasExpirationMessage = 
      errorText.includes('expired') ||
      errorText.includes('invalid') ||
      errorText.includes('token') ||
      errorText.includes('unauthorized');

    expect(hasExpirationMessage).toBe(true);
  });
});
