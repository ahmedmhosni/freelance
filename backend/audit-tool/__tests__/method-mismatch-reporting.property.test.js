/**
 * Property-Based Test: Method Mismatch Reporting
 * 
 * **Feature: route-matching-improvement, Property 5: Method mismatch reporting**
 * 
 * For any two routes where paths match but methods differ, the matcher should report 
 * them as unmatched with reason "method-mismatch".
 * 
 * **Validates: Requirements 3.2**
 */

const fc = require('fast-check');
const { pathsMatchWithReason } = require('../utils/pathNormalizer');

describe('Property 5: Method mismatch reporting', () => {
  /**
   * Test that method mismatch is reported with correct reason
   */
  test('for any routes with matching paths but different methods, reason should be method-mismatch', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects', '/api/users'),
          method1: fc.constantFrom('GET', 'POST', 'PUT'),
          method2: fc.constantFrom('DELETE', 'PATCH', 'OPTIONS')
        }),
        ({ path, method1, method2 }) => {
          const result = pathsMatchWithReason(path, path, method1, method2);
          
          expect(result.match).toBe(false);
          expect(result.reason).toBe('method-mismatch');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that method mismatch is reported for routes with parameters
   */
  test('for any routes with parameters and different methods, reason should be method-mismatch', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          id: fc.integer({ min: 1, max: 999999 }),
          method1: fc.constantFrom('GET', 'POST'),
          method2: fc.constantFrom('PUT', 'DELETE')
        }),
        ({ basePath, id, method1, method2 }) => {
          const pathWithId = `${basePath}/${id}`;
          const pathWithParam = `${basePath}/:id`;
          
          const result = pathsMatchWithReason(pathWithId, pathWithParam, method1, method2);
          
          expect(result.match).toBe(false);
          expect(result.reason).toBe('method-mismatch');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that method mismatch is reported for complex paths
   */
  test('for any complex paths with different methods, reason should be method-mismatch', () => {
    fc.assert(
      fc.property(
        fc.record({
          id1: fc.integer({ min: 1, max: 999999 }),
          id2: fc.integer({ min: 1, max: 999999 }),
          method1: fc.constantFrom('GET', 'POST'),
          method2: fc.constantFrom('PUT', 'DELETE')
        }),
        ({ id1, id2, method1, method2 }) => {
          const pathWithIds = `/api/tasks/${id1}/comments/${id2}`;
          const pathWithParams = `/api/tasks/:taskId/comments/:commentId`;
          
          const result = pathsMatchWithReason(pathWithIds, pathWithParams, method1, method2);
          
          expect(result.match).toBe(false);
          expect(result.reason).toBe('method-mismatch');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that method mismatch takes precedence over path mismatch
   */
  test('for any routes with both method and path mismatch, method-mismatch should be reported first', () => {
    fc.assert(
      fc.property(
        fc.record({
          path1: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          path2: fc.constantFrom('/api/projects', '/api/users', '/api/reports'),
          method1: fc.constantFrom('GET', 'POST'),
          method2: fc.constantFrom('PUT', 'DELETE')
        }),
        ({ path1, path2, method1, method2 }) => {
          // Ensure paths are different
          fc.pre(path1 !== path2);
          
          const result = pathsMatchWithReason(path1, path2, method1, method2);
          
          expect(result.match).toBe(false);
          // Method mismatch should be checked first
          expect(result.reason).toBe('method-mismatch');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that GET vs POST always reports method-mismatch
   */
  test('for any path, GET vs POST should report method-mismatch', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects', '/api/users'),
        (path) => {
          const result = pathsMatchWithReason(path, path, 'GET', 'POST');
          
          expect(result.match).toBe(false);
          expect(result.reason).toBe('method-mismatch');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that PUT vs DELETE always reports method-mismatch
   */
  test('for any path, PUT vs DELETE should report method-mismatch', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects', '/api/users'),
        (path) => {
          const result = pathsMatchWithReason(path, path, 'PUT', 'DELETE');
          
          expect(result.match).toBe(false);
          expect(result.reason).toBe('method-mismatch');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that method mismatch is reported even with query parameters
   */
  test('for any paths with query parameters and different methods, reason should be method-mismatch', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          queryParam: fc.constantFrom('status=active', 'page=1', 'limit=10'),
          method1: fc.constantFrom('GET', 'POST'),
          method2: fc.constantFrom('PUT', 'DELETE')
        }),
        ({ basePath, queryParam, method1, method2 }) => {
          const pathWithQuery = `${basePath}?${queryParam}`;
          
          const result = pathsMatchWithReason(pathWithQuery, basePath, method1, method2);
          
          expect(result.match).toBe(false);
          expect(result.reason).toBe('method-mismatch');
        }
      ),
      { numRuns: 100 }
    );
  });
});
