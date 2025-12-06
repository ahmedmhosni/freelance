/**
 * Property-Based Test: Registration Validation
 * 
 * **Feature: full-system-audit, Property 23: Registration Validation**
 * 
 * For any registration attempt, valid data should create a new user account,
 * and invalid data should be rejected with appropriate validation errors.
 * 
 * **Validates: Requirements 6.5**
 */

const fc = require('fast-check');
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

/**
 * Generator for valid registration data
 */
const validRegistrationArbitrary = fc.record({
  name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 50 })
    .filter(p => /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p))
}).map(data => ({
  ...data,
  // Add timestamp to make email unique
  email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`
}));

/**
 * Generator for invalid registration data
 */
const invalidRegistrationArbitrary = fc.oneof(
  // Missing name
  fc.record({
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 })
  }),
  // Missing email
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 50 }),
    password: fc.string({ minLength: 8, maxLength: 50 })
  }),
  // Missing password
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 50 }),
    email: fc.emailAddress()
  }),
  // Empty name
  fc.record({
    name: fc.constant(''),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 })
  }),
  // Invalid email format
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 50 }),
    email: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@') && s.trim().length > 0),
    password: fc.string({ minLength: 8, maxLength: 50 })
  }),
  // Password too short
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 50 }),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 1, maxLength: 7 })
  }),
  // Password without uppercase
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 50 }),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 })
      .filter(p => !/[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p))
  }),
  // Password without lowercase
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 50 }),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 })
      .filter(p => /[A-Z]/.test(p) && !/[a-z]/.test(p) && /[0-9]/.test(p))
  }),
  // Password without numbers
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 50 }),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 })
      .filter(p => /[A-Z]/.test(p) && /[a-z]/.test(p) && !/[0-9]/.test(p))
  })
);

describe('Property 23: Registration Validation', () => {
  const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true // Don't throw on any status
  });

  const createdUserIds = [];

  afterAll(async () => {
    // Cleanup: Try to delete created test users
    // Note: This requires admin access or the user's own token
    for (const userId of createdUserIds) {
      try {
        await client.delete(`/api/users/${userId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  test('valid registration data creates new user account', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRegistrationArbitrary,
        async (validData) => {
          const response = await client.post('/api/auth/register', validData);

          // Should return 201 Created or 200 OK
          expect(response.status).toBeGreaterThanOrEqual(200);
          expect(response.status).toBeLessThan(300);

          // Should return user data
          expect(response.data).toBeTruthy();
          
          // Should include user ID
          if (response.data.user) {
            expect(response.data.user).toHaveProperty('id');
            createdUserIds.push(response.data.user.id);
          } else if (response.data.id) {
            createdUserIds.push(response.data.id);
          }

          // Note: Implementation requires email verification before login
          // Token may not be returned immediately
          // Just verify successful registration
          if (response.data.token) {
            expect(typeof response.data.token).toBe('string');
            expect(response.data.token.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 10 } // Limited runs to avoid creating too many test users
    );
  }, 30000);

  test('invalid registration data is rejected with validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidRegistrationArbitrary,
        async (invalidData) => {
          const response = await client.post('/api/auth/register', invalidData);

          // Should return 400-level status code
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.status).toBeLessThan(500);

          // Should include error message
          expect(response.data).toBeTruthy();
          
          const hasErrorMessage = 
            response.data.error ||
            response.data.message ||
            response.data.errors ||
            response.data.details;

          expect(hasErrorMessage).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('duplicate email registration is rejected', async () => {
    // First registration
    const userData = {
      name: 'Test User',
      email: `duplicate-test-${Date.now()}@example.com`,
      password: 'TestPassword123'
    };

    const response1 = await client.post('/api/auth/register', userData);
    expect(response1.status).toBeGreaterThanOrEqual(200);
    expect(response1.status).toBeLessThan(300);

    if (response1.data.user?.id) {
      createdUserIds.push(response1.data.user.id);
    } else if (response1.data.id) {
      createdUserIds.push(response1.data.id);
    }

    // Attempt duplicate registration
    const response2 = await client.post('/api/auth/register', userData);

    // Should be rejected
    expect(response2.status).toBeGreaterThanOrEqual(400);
    expect(response2.status).toBeLessThan(500);

    // Should have error message about duplicate email
    const errorText = JSON.stringify(response2.data).toLowerCase();
    const hasDuplicateMessage = 
      errorText.includes('exist') ||
      errorText.includes('duplicate') ||
      errorText.includes('already') ||
      errorText.includes('taken');

    expect(hasDuplicateMessage).toBe(true);
  });

  test('validation errors are descriptive and specific', async () => {
    // Test with missing required field
    const invalidData = {
      name: 'Test User'
      // Missing email and password
    };

    const response = await client.post('/api/auth/register', invalidData);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);

    // Error should mention what's missing
    const errorText = JSON.stringify(response.data).toLowerCase();
    
    // Should mention email or password or required fields
    const hasSpecificError = 
      errorText.includes('email') ||
      errorText.includes('password') ||
      errorText.includes('required');

    expect(hasSpecificError).toBe(true);
  });

  test('successful registration returns complete user data', async () => {
    const userData = {
      name: 'Complete Test User',
      email: `complete-test-${Date.now()}@example.com`,
      password: 'CompleteTest123'
    };

    const response = await client.post('/api/auth/register', userData);

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);

    // Should return user object
    const user = response.data.user || response.data;
    
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user.email).toBe(userData.email);
    
    // Should NOT return password
    expect(user.password).toBeUndefined();

    // Note: Token may not be returned if email verification is required
    // Just verify user data is complete

    if (user.id) {
      createdUserIds.push(user.id);
    }
  });

  test('registration with SQL injection attempts is safely handled', async () => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "admin'--",
      "' OR '1'='1",
      "1' UNION SELECT * FROM users--"
    ];

    for (const injection of sqlInjectionAttempts) {
      const response = await client.post('/api/auth/register', {
        name: injection,
        email: `injection-${Date.now()}@example.com`,
        password: 'TestPassword123'
      });

      // Should either reject or safely handle
      // If accepted, should store as literal string, not execute SQL
      if (response.status >= 200 && response.status < 300) {
        const user = response.data.user || response.data;
        // Name should be stored as-is, not executed
        expect(user.name).toBe(injection);
        
        if (user.id) {
          createdUserIds.push(user.id);
        }
      }
    }
  });
});
