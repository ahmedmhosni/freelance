/**
 * Property-Based Test: Login Token Issuance
 * 
 * **Feature: full-system-audit, Property 20: Login Token Issuance**
 * 
 * For any valid login credentials, the authentication system should issue a valid JWT token;
 * for invalid credentials, it should reject the login attempt.
 * 
 * **Validates: Requirements 6.1**
 */

const fc = require('fast-check');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration - read from environment
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production_12345';

// Test user credentials - use admin account
const VALID_CREDENTIALS = {
  email: 'ahmedmhosni90@gmail.com',
  password: '123456'
};

/**
 * Generator for invalid credentials
 */
const invalidCredentialsArbitrary = fc.oneof(
  // Wrong password
  fc.record({
    email: fc.constant(VALID_CREDENTIALS.email),
    password: fc.string({ minLength: 1, maxLength: 20 }).filter(p => p !== VALID_CREDENTIALS.password)
  }),
  // Wrong email
  fc.record({
    email: fc.emailAddress().filter(e => e !== VALID_CREDENTIALS.email),
    password: fc.constant(VALID_CREDENTIALS.password)
  }),
  // Both wrong
  fc.record({
    email: fc.emailAddress().filter(e => e !== VALID_CREDENTIALS.email),
    password: fc.string({ minLength: 1, maxLength: 20 }).filter(p => p !== VALID_CREDENTIALS.password)
  }),
  // Empty credentials
  fc.record({
    email: fc.constant(''),
    password: fc.constant('')
  }),
  // Missing fields
  fc.record({
    email: fc.emailAddress()
  }),
  fc.record({
    password: fc.string({ minLength: 1, maxLength: 20 })
  })
);

describe('Property 20: Login Token Issuance', () => {
  const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true // Don't throw on any status
  });

  test('valid credentials result in JWT token issuance', async () => {
    // Test with known valid credentials
    const response = await client.post('/api/auth/login', VALID_CREDENTIALS);

    // Should return 200 OK
    expect(response.status).toBe(200);

    // Should include a token
    expect(response.data).toHaveProperty('token');
    expect(typeof response.data.token).toBe('string');
    expect(response.data.token.length).toBeGreaterThan(0);

    // Token should be a valid JWT
    const decoded = jwt.decode(response.data.token);
    expect(decoded).toBeTruthy();
    expect(decoded).toHaveProperty('id');
    expect(decoded).toHaveProperty('email');

    // Token should be verifiable with the secret
    expect(() => {
      jwt.verify(response.data.token, JWT_SECRET);
    }).not.toThrow();
  });

  test('invalid credentials are rejected without token issuance', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidCredentialsArbitrary,
        async (invalidCreds) => {
          const response = await client.post('/api/auth/login', invalidCreds);

          // Should return 400 or 401 status
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.status).toBeLessThan(500);

          // Should NOT include a valid token
          if (response.data && response.data.token) {
            // If a token is present, it should be invalid or empty
            expect(response.data.token).toBe('');
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('issued tokens contain required claims', async () => {
    // Login with valid credentials
    const response = await client.post('/api/auth/login', VALID_CREDENTIALS);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');

    // Decode and verify token structure
    const decoded = jwt.decode(response.data.token);

    // Required claims
    expect(decoded).toHaveProperty('id');
    expect(decoded).toHaveProperty('email');
    expect(decoded).toHaveProperty('iat'); // Issued at
    expect(decoded).toHaveProperty('exp'); // Expiration

    // Verify claim types
    expect(typeof decoded.id).toBe('number');
    expect(typeof decoded.email).toBe('string');
    expect(typeof decoded.iat).toBe('number');
    expect(typeof decoded.exp).toBe('number');

    // Expiration should be in the future
    const now = Math.floor(Date.now() / 1000);
    expect(decoded.exp).toBeGreaterThan(now);
  });

  test('token signature is valid and verifiable', async () => {
    // Login with valid credentials
    const response = await client.post('/api/auth/login', VALID_CREDENTIALS);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');

    const token = response.data.token;

    // Verify token with correct secret
    let decoded;
    expect(() => {
      decoded = jwt.verify(token, JWT_SECRET);
    }).not.toThrow();

    expect(decoded).toBeTruthy();

    // Verify token fails with wrong secret
    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });

  test('multiple logins with same credentials produce different tokens', async () => {
    // Login twice with same credentials with a delay to ensure different iat
    const response1 = await client.post('/api/auth/login', VALID_CREDENTIALS);
    
    // Wait 1 second to ensure different iat timestamp
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response2 = await client.post('/api/auth/login', VALID_CREDENTIALS);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    const token1 = response1.data.token;
    const token2 = response2.data.token;

    // Tokens should be different (different iat timestamps)
    expect(token1).not.toBe(token2);

    // But both should be valid
    const decoded1 = jwt.verify(token1, JWT_SECRET);
    const decoded2 = jwt.verify(token2, JWT_SECRET);

    expect(decoded1).toBeTruthy();
    expect(decoded2).toBeTruthy();

    // Should have same id and email
    expect(decoded1.id).toBe(decoded2.id);
    expect(decoded1.email).toBe(decoded2.email);
  });
});
