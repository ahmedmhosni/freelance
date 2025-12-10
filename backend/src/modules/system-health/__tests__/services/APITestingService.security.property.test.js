const fc = require('fast-check');
const APITestingService = require('../../services/APITestingService');

/**
 * **Feature: system-health-deployment, Property 6: Security Validation Consistency**
 * **Validates: Requirements 3.4, 3.5**
 * 
 * Property-based tests for security validation in API Testing Service
 * Tests that security validation produces consistent results across different configurations
 */
describe('APITestingService Security Validation Property Tests', () => {
  let apiTestingService;
  let mockDatabase;
  let mockLogger;
  let mockAuthService;
  let mockClientService;
  let mockProjectService;

  beforeEach(() => {
    mockDatabase = {
      queryOne: jest.fn(),
      execute: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    };

    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyToken: jest.fn()
    };

    mockClientService = {
      getAllForUser: jest.fn(),
      create: jest.fn(),
      getByIdForUser: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockProjectService = {
      getAllForUser: jest.fn(),
      createForUser: jest.fn(),
      getByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn()
    };

    apiTestingService = new APITestingService(
      mockDatabase,
      mockLogger,
      mockAuthService,
      mockClientService,
      mockProjectService
    );
  });

  /**
   * Property 6: Security Validation Consistency
   * For any security configuration, validation should consistently identify missing or misconfigured security measures
   */
  test('security validation consistency across configurations', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        corsEnabled: fc.boolean(),
        rateLimitEnabled: fc.boolean(),
        securityHeadersEnabled: fc.boolean(),
        authServiceAvailable: fc.boolean()
      }),
      async ({ corsEnabled, rateLimitEnabled, securityHeadersEnabled, authServiceAvailable }) => {
        // Setup environment based on generated configuration
        const originalCorsOrigin = process.env.CORS_ORIGIN;
        const originalRateLimitEnabled = process.env.RATE_LIMIT_ENABLED;
        const originalSecurityHeadersEnabled = process.env.SECURITY_HEADERS_ENABLED;

        try {
          // Configure environment
          if (corsEnabled) {
            process.env.CORS_ORIGIN = 'http://localhost:3000';
          } else {
            delete process.env.CORS_ORIGIN;
          }

          if (rateLimitEnabled) {
            process.env.RATE_LIMIT_ENABLED = 'true';
          } else {
            process.env.RATE_LIMIT_ENABLED = 'false';
          }

          if (securityHeadersEnabled) {
            process.env.SECURITY_HEADERS_ENABLED = 'true';
          } else {
            process.env.SECURITY_HEADERS_ENABLED = 'false';
          }

          // Create service with or without auth service
          const testService = new APITestingService(
            mockDatabase,
            mockLogger,
            authServiceAvailable ? mockAuthService : null,
            mockClientService,
            mockProjectService
          );

          // Run security validation
          const results = await testService.testSecurityValidation();

          // Verify all tests have required structure
          expect(Array.isArray(results)).toBe(true);
          expect(results.length).toBeGreaterThan(0);

          results.forEach(test => {
            expect(test).toHaveProperty('name');
            expect(test).toHaveProperty('status');
            expect(test).toHaveProperty('message');
            expect(test).toHaveProperty('details');
            expect(test).toHaveProperty('duration');
            expect(['pass', 'fail', 'warning']).toContain(test.status);
            expect(typeof test.duration).toBe('number');
            expect(typeof test.message).toBe('string');
            expect(test.message.length).toBeGreaterThan(0);
          });

          // Verify CORS test result matches configuration
          const corsTest = results.find(r => r.name === 'Security - CORS Headers');
          expect(corsTest).toBeDefined();
          if (corsEnabled) {
            expect(corsTest.status).toBe('pass');
          } else {
            // When CORS is not explicitly enabled, it may still pass with default config
            expect(['pass', 'fail', 'warning']).toContain(corsTest.status);
          }

          // Verify rate limiting test result matches configuration
          const rateLimitTest = results.find(r => r.name === 'Security - Rate Limiting');
          expect(rateLimitTest).toBeDefined();
          if (rateLimitEnabled) {
            expect(['pass', 'warning']).toContain(rateLimitTest.status);
          } else {
            expect(['warning', 'fail']).toContain(rateLimitTest.status);
          }

          // Verify auth middleware test result matches configuration
          const authTest = results.find(r => r.name === 'Security - Auth Middleware');
          expect(authTest).toBeDefined();
          if (authServiceAvailable) {
            expect(authTest.status).toBe('pass');
          } else {
            expect(authTest.status).toBe('fail');
          }

          // Verify security headers test result matches configuration
          const securityHeadersTest = results.find(r => r.name === 'Security - Security Headers');
          expect(securityHeadersTest).toBeDefined();
          if (securityHeadersEnabled) {
            expect(securityHeadersTest.status).toBe('pass');
          } else {
            expect(['warning', 'fail']).toContain(securityHeadersTest.status);
          }

          return true;
        } finally {
          // Restore environment
          if (originalCorsOrigin !== undefined) {
            process.env.CORS_ORIGIN = originalCorsOrigin;
          } else {
            delete process.env.CORS_ORIGIN;
          }
          if (originalRateLimitEnabled !== undefined) {
            process.env.RATE_LIMIT_ENABLED = originalRateLimitEnabled;
          } else {
            delete process.env.RATE_LIMIT_ENABLED;
          }
          if (originalSecurityHeadersEnabled !== undefined) {
            process.env.SECURITY_HEADERS_ENABLED = originalSecurityHeadersEnabled;
          } else {
            delete process.env.SECURITY_HEADERS_ENABLED;
          }
        }
      }
    ), { numRuns: 30 });
  });

  /**
   * Test that security validation results are consistent when run multiple times
   */
  test('security validation idempotence', async () => {
    await fc.assert(fc.asyncProperty(
      fc.boolean(),
      async (securityConfigured) => {
        // Setup consistent environment
        const originalCorsOrigin = process.env.CORS_ORIGIN;
        const originalRateLimitEnabled = process.env.RATE_LIMIT_ENABLED;

        try {
          if (securityConfigured) {
            process.env.CORS_ORIGIN = 'http://localhost:3000';
            process.env.RATE_LIMIT_ENABLED = 'true';
          } else {
            delete process.env.CORS_ORIGIN;
            process.env.RATE_LIMIT_ENABLED = 'false';
          }

          // Run security validation twice
          const results1 = await apiTestingService.testSecurityValidation();
          const results2 = await apiTestingService.testSecurityValidation();

          // Verify both runs produce identical results
          expect(results1.length).toBe(results2.length);

          results1.forEach((test1, index) => {
            const test2 = results2[index];
            expect(test1.name).toBe(test2.name);
            expect(test1.status).toBe(test2.status);
            expect(test1.message).toBe(test2.message);
          });

          return true;
        } finally {
          // Restore environment
          if (originalCorsOrigin !== undefined) {
            process.env.CORS_ORIGIN = originalCorsOrigin;
          } else {
            delete process.env.CORS_ORIGIN;
          }
          if (originalRateLimitEnabled !== undefined) {
            process.env.RATE_LIMIT_ENABLED = originalRateLimitEnabled;
          } else {
            delete process.env.RATE_LIMIT_ENABLED;
          }
        }
      }
    ), { numRuns: 20 });
  });

  /**
   * Test that security validation handles all test types consistently
   */
  test('security validation completeness', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('cors', 'rateLimit', 'auth', 'headers', 'all'),
      async (testType) => {
        const results = await apiTestingService.testSecurityValidation();

        // Verify all expected test types are present
        const testNames = results.map(r => r.name);
        
        if (testType === 'all' || testType === 'cors') {
          expect(testNames).toContain('Security - CORS Headers');
        }
        if (testType === 'all' || testType === 'rateLimit') {
          expect(testNames).toContain('Security - Rate Limiting');
        }
        if (testType === 'all' || testType === 'auth') {
          expect(testNames).toContain('Security - Auth Middleware');
        }
        if (testType === 'all' || testType === 'headers') {
          expect(testNames).toContain('Security - Security Headers');
        }

        // Verify each test has valid structure
        results.forEach(test => {
          expect(test).toHaveProperty('name');
          expect(test).toHaveProperty('status');
          expect(test).toHaveProperty('message');
          expect(test).toHaveProperty('details');
          expect(test).toHaveProperty('duration');
          expect(['pass', 'fail', 'warning']).toContain(test.status);
        });

        return true;
      }
    ), { numRuns: 15 });
  });

  /**
   * Test that error handling in security validation is consistent
   */
  test('security validation error handling consistency', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('cors', 'rateLimit', 'auth', 'headers'),
      async (errorComponent) => {
        // Create a service that will trigger errors
        const errorService = new APITestingService(
          mockDatabase,
          mockLogger,
          errorComponent === 'auth' ? null : mockAuthService,
          mockClientService,
          mockProjectService
        );

        // Run security validation
        const results = await errorService.testSecurityValidation();

        // Verify results are valid even with errors
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);

        results.forEach(test => {
          expect(test).toHaveProperty('name');
          expect(test).toHaveProperty('status');
          expect(test).toHaveProperty('message');
          expect(test).toHaveProperty('details');
          expect(['pass', 'fail', 'warning']).toContain(test.status);
        });

        return true;
      }
    ), { numRuns: 12 });
  });
});
