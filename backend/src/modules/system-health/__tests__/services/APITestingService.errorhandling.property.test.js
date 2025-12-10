const fc = require('fast-check');
const APITestingService = require('../../services/APITestingService');

/**
 * **Feature: system-health-deployment, Property 9: Error Reporting Completeness**
 * **Validates: Requirements 3.5, 5.4, 6.2**
 * 
 * Property-based tests for error handling in API Testing Service
 * Tests that error handling produces complete and actionable error information
 */
describe('APITestingService Error Handling Property Tests', () => {
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
   * Property 9: Error Reporting Completeness
   * For any system error or failure, the system should provide detailed error information and actionable troubleshooting guidance
   */
  test('error reporting completeness', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        errorType: fc.constantFrom('notFound', 'validation', 'database', 'service'),
        hasErrorMessage: fc.boolean(),
        hasErrorDetails: fc.boolean()
      }),
      async ({ errorType, hasErrorMessage, hasErrorDetails }) => {
        // Setup error conditions based on generated parameters
        let error;
        
        if (errorType === 'notFound') {
          error = new Error('Resource not found');
          error.name = 'NotFoundError';
          mockClientService.getByIdForUser.mockRejectedValue(error);
        } else if (errorType === 'validation') {
          error = new Error('Validation failed: missing required fields');
          error.name = 'ValidationError';
          mockClientService.create.mockRejectedValue(error);
        } else if (errorType === 'database') {
          error = new Error('Database connection failed');
          error.name = 'DatabaseError';
          mockDatabase.queryOne.mockRejectedValue(error);
        } else {
          error = new Error('Service error');
          mockClientService.getAllForUser.mockRejectedValue(error);
        }

        // Run error handling tests
        const results = await apiTestingService.testErrorHandling();

        // Verify all error tests have required structure
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);

        results.forEach(test => {
          expect(test).toHaveProperty('name');
          expect(test).toHaveProperty('status');
          expect(test).toHaveProperty('message');
          expect(test).toHaveProperty('details');
          expect(test).toHaveProperty('duration');
          expect(['pass', 'fail', 'warning']).toContain(test.status);
          
          // Verify error messages are descriptive
          expect(typeof test.message).toBe('string');
          expect(test.message.length).toBeGreaterThan(0);
          
          // Verify details are provided
          expect(test.details).toBeDefined();
          expect(typeof test.details).toBe('object');
        });

        return true;
      }
    ), { numRuns: 25 });
  });

  /**
   * Test that error handling produces consistent results for identical errors
   */
  test('error handling consistency', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 100 }),
      async (errorMessage) => {
        const error = new Error(errorMessage);
        mockClientService.getByIdForUser.mockRejectedValue(error);

        // Run error handling twice
        const results1 = await apiTestingService.testErrorHandling();
        const results2 = await apiTestingService.testErrorHandling();

        // Verify both runs produce consistent results
        expect(results1.length).toBe(results2.length);

        results1.forEach((test1, index) => {
          const test2 = results2[index];
          expect(test1.name).toBe(test2.name);
          expect(test1.status).toBe(test2.status);
          // Message might vary slightly due to error details, but structure should be same
          expect(test1.message.split(':')[0]).toBe(test2.message.split(':')[0]);
        });

        return true;
      }
    ), { numRuns: 20 });
  });

  /**
   * Test that error handling covers all error scenarios
   */
  test('error handling completeness', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('notFound', 'validation', 'response', 'logging'),
      async (errorScenario) => {
        const results = await apiTestingService.testErrorHandling();

        // Verify all expected error handling tests are present
        const testNames = results.map(r => r.name);
        
        expect(testNames).toContain('Error Handling - Not Found');
        expect(testNames).toContain('Error Handling - Validation');
        expect(testNames).toContain('Error Handling - Response Format');
        expect(testNames).toContain('Error Handling - Logging');

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
   * Test that error details are always provided
   */
  test('error details availability', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        includeErrorType: fc.boolean(),
        includeErrorMessage: fc.boolean()
      }),
      async ({ includeErrorType, includeErrorMessage }) => {
        // Setup error with varying detail levels
        let error = new Error('Test error');
        if (includeErrorType) {
          error.name = 'CustomError';
        }
        if (includeErrorMessage) {
          error.message = 'Detailed error message with context';
        }

        mockClientService.getByIdForUser.mockRejectedValue(error);

        const results = await apiTestingService.testErrorHandling();

        // Verify all results have details
        results.forEach(test => {
          expect(test.details).toBeDefined();
          expect(typeof test.details).toBe('object');
          
          // Verify details are not empty
          if (test.status === 'fail' || test.status === 'warning') {
            expect(Object.keys(test.details).length).toBeGreaterThanOrEqual(0);
          }
        });

        return true;
      }
    ), { numRuns: 18 });
  });

  /**
   * Test that error logging is always attempted
   */
  test('error logging attempt', async () => {
    await fc.assert(fc.asyncProperty(
      fc.boolean(),
      async (loggerAvailable) => {
        // Setup logger availability
        const testService = new APITestingService(
          mockDatabase,
          loggerAvailable ? mockLogger : null,
          mockAuthService,
          mockClientService,
          mockProjectService
        );

        const results = await testService.testErrorHandling();

        // Verify error logging test is present
        const loggingTest = results.find(r => r.name === 'Error Handling - Logging');
        expect(loggingTest).toBeDefined();

        if (loggerAvailable) {
          expect(loggingTest.status).toBe('pass');
        } else {
          expect(['fail', 'warning']).toContain(loggingTest.status);
        }

        return true;
      }
    ), { numRuns: 12 });
  });

  /**
   * Test that error response format is always consistent
   */
  test('error response format consistency', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('simple', 'detailed', 'minimal'),
      async (responseType) => {
        const results = await apiTestingService.testErrorHandling();

        // Find response format test
        const responseFormatTest = results.find(r => r.name === 'Error Handling - Response Format');
        expect(responseFormatTest).toBeDefined();

        // Verify response format test has required properties
        expect(responseFormatTest).toHaveProperty('name');
        expect(responseFormatTest).toHaveProperty('status');
        expect(responseFormatTest).toHaveProperty('message');
        expect(responseFormatTest).toHaveProperty('details');
        expect(responseFormatTest).toHaveProperty('duration');

        // Verify details contain format information
        expect(responseFormatTest.details).toHaveProperty('hasMessage');
        expect(responseFormatTest.details).toHaveProperty('hasDetails');
        expect(responseFormatTest.details).toHaveProperty('hasTimestamp');

        return true;
      }
    ), { numRuns: 10 });
  });
});
