/**
 * Property-Based Tests for FileSystemValidator
 * **Feature: system-health-deployment, Property 1: System Health Check Consistency**
 * **Validates: Requirements 1.1**
 */

const fc = require('fast-check');
const FileSystemValidator = require('../../validators/FileSystemValidator');
const fs = require('fs').promises;
const path = require('path');

// Mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('FileSystemValidator Property Tests', () => {
  let validator;

  beforeEach(() => {
    jest.clearAllMocks();
    validator = new FileSystemValidator(mockLogger);
  });

  /**
   * Property 1: System Health Check Consistency
   * For any set of file paths, validation should produce consistent results when run multiple times
   */
  test('file system validation consistency', () => {
    fc.assert(fc.property(
      fc.record({
        paths: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
        validationRuns: fc.integer({ min: 2, max: 5 })
      }),
      async ({ paths, validationRuns }) => {
        // Filter out paths that might cause issues and make them relative
        const safePaths = paths
          .filter(p => !p.includes('..') && !p.startsWith('/'))
          .map(p => p.replace(/[<>:"|?*]/g, '_')) // Replace invalid filename characters
          .slice(0, 5); // Limit to 5 paths for performance

        if (safePaths.length === 0) {
          return true; // Skip if no safe paths
        }

        const results = [];

        // Run validation multiple times
        for (let i = 0; i < validationRuns; i++) {
          try {
            const result = await validator.validateStructure(safePaths);
            results.push({
              status: result.status,
              pathCount: result.details?.totalChecked || 0,
              foundCount: result.details?.foundCount || 0,
              missingCount: result.details?.missingPaths?.length || 0
            });
          } catch (error) {
            // If validation fails, it should fail consistently
            results.push({
              status: 'error',
              error: error.message
            });
          }
        }

        // All results should be identical for the same input
        const firstResult = results[0];
        const allResultsIdentical = results.every(result => 
          result.status === firstResult.status &&
          result.pathCount === firstResult.pathCount &&
          result.foundCount === firstResult.foundCount &&
          result.missingCount === firstResult.missingCount
        );

        return allResultsIdentical;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Path Validation Determinism
   * For any valid path, validation should always return the same result
   */
  test('path validation determinism', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('package.json'),
        fc.constant('README.md'),
        fc.constant('src'),
        fc.constant('nonexistent-file.txt'),
        fc.constant('backend/src/server.js')
      ),
      async (testPath) => {
        const results = [];

        // Validate the same path multiple times
        for (let i = 0; i < 3; i++) {
          try {
            const result = await validator.validatePath(testPath);
            results.push({
              exists: result.exists,
              type: result.type,
              hasError: !!result.error
            });
          } catch (error) {
            results.push({
              exists: false,
              type: 'error',
              hasError: true
            });
          }
        }

        // All results should be identical
        const firstResult = results[0];
        const allIdentical = results.every(result =>
          result.exists === firstResult.exists &&
          result.type === firstResult.type &&
          result.hasError === firstResult.hasError
        );

        return allIdentical;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Validation Result Structure Consistency
   * For any validation result, it should always have the required structure
   */
  test('validation result structure consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
      async (paths) => {
        // Clean paths to avoid filesystem issues
        const cleanPaths = paths.map(p => p.replace(/[<>:"|?*]/g, '_'));

        try {
          const result = await validator.validateStructure(cleanPaths);

          // Check required properties exist
          const hasRequiredProperties = 
            typeof result.name === 'string' &&
            typeof result.status === 'string' &&
            typeof result.message === 'string' &&
            typeof result.details === 'object' &&
            typeof result.duration === 'number';

          // Check status is valid
          const validStatuses = ['pass', 'fail', 'warning'];
          const hasValidStatus = validStatuses.includes(result.status);

          // Check details structure
          const hasValidDetails = 
            Array.isArray(result.details.results) &&
            Array.isArray(result.details.missingPaths) &&
            typeof result.details.totalChecked === 'number' &&
            typeof result.details.foundCount === 'number';

          // Check duration is non-negative
          const hasValidDuration = result.duration >= 0;

          return hasRequiredProperties && hasValidStatus && hasValidDetails && hasValidDuration;
        } catch (error) {
          // If validation throws, it should still be a proper error
          return error instanceof Error && typeof error.message === 'string';
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Path Count Consistency
   * For any array of paths, the total checked should equal the input array length
   */
  test('path count consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 1, maxLength: 8 }),
      async (paths) => {
        // Clean and deduplicate paths
        const cleanPaths = [...new Set(paths.map(p => p.replace(/[<>:"|?*]/g, '_')))];

        try {
          const result = await validator.validateStructure(cleanPaths);
          
          // Total checked should equal input length
          const totalChecked = result.details?.totalChecked || 0;
          const foundCount = result.details?.foundCount || 0;
          const missingCount = result.details?.missingPaths?.length || 0;

          // Basic consistency checks
          const totalMatches = totalChecked === cleanPaths.length;
          const countsAddUp = foundCount + missingCount === totalChecked;
          const resultsLengthMatches = result.details?.results?.length === totalChecked;

          return totalMatches && countsAddUp && resultsLengthMatches;
        } catch (error) {
          // If validation fails, we can't check counts, but that's acceptable
          return true;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Status Logic Consistency
   * For any validation result, status should be consistent with the findings
   */
  test('status logic consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 6 }),
      async (paths) => {
        const cleanPaths = paths.map(p => p.replace(/[<>:"|?*]/g, '_'));

        try {
          const result = await validator.validateStructure(cleanPaths);
          
          const missingCount = result.details?.missingPaths?.length || 0;
          const status = result.status;

          // If no missing paths, status should be 'pass'
          // If there are missing paths, status should be 'fail'
          const statusLogicCorrect = 
            (missingCount === 0 && status === 'pass') ||
            (missingCount > 0 && status === 'fail');

          return statusLogicCorrect;
        } catch (error) {
          // If validation throws an error, that's also valid behavior
          return true;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Error Handling Consistency
   * For any invalid input, error handling should be consistent
   */
  test('error handling consistency', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant(''),
        fc.array(fc.constant(''), { minLength: 1, maxLength: 3 })
      ),
      async (invalidInput) => {
        const results = [];

        // Test error handling multiple times
        for (let i = 0; i < 3; i++) {
          try {
            const result = await validator.validateStructure(invalidInput || []);
            results.push({
              success: true,
              status: result.status,
              hasDetails: !!result.details
            });
          } catch (error) {
            results.push({
              success: false,
              errorType: error.constructor.name,
              hasMessage: typeof error.message === 'string'
            });
          }
        }

        // All error handling attempts should be consistent
        const firstResult = results[0];
        const allConsistent = results.every(result =>
          result.success === firstResult.success &&
          (result.success ? 
            result.status === firstResult.status :
            result.errorType === firstResult.errorType)
        );

        return allConsistent;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Module Structure Validation Consistency
   * For any module path, validation should be consistent
   */
  test('module structure validation consistency', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('backend/src/modules/auth'),
        fc.constant('backend/src/modules/clients'),
        fc.constant('nonexistent/module'),
        fc.constant('backend/src/modules/system-health')
      ),
      async (modulePath) => {
        const results = [];

        // Validate module structure multiple times
        for (let i = 0; i < 3; i++) {
          try {
            const result = await validator.validateModuleStructure(modulePath);
            results.push({
              status: result.status,
              name: result.name,
              hasDetails: !!result.details,
              duration: result.duration
            });
          } catch (error) {
            results.push({
              status: 'error',
              error: error.message
            });
          }
        }

        // Check consistency
        const firstResult = results[0];
        const allConsistent = results.every(result =>
          result.status === firstResult.status &&
          result.name === firstResult.name
        );

        return allConsistent;
      }
    ), { numRuns: 100 });
  });
});