/**
 * Property-Based Test: Method Matching Requirement
 * 
 * **Feature: route-matching-improvement, Property 4: Method matching requirement**
 * 
 * For any two routes with matching paths, they should be considered matched if and only if 
 * their HTTP methods also match (case-insensitively).
 * 
 * **Validates: Requirements 3.1**
 */

const fc = require('fast-check');
const { pathsMatchWithReason } = require('../utils/pathNormalizer');

describe('Property 4: Method matching requirement', () => {
  /**
   * Test that routes with matching paths and matching methods are matched
   */
  test('for any two routes with matching paths and methods, they should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects', '/api/users'),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
        }),
        ({ path, method }) => {
          const result = pathsMatchWithReason(path, path, method, method);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that routes with matching paths but different methods do not match
   */
  test('for any two routes with matching paths but different methods, they should not match', () => {
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
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that routes with matching paths and parameters match when methods match
   */
  test('for any routes with parameters, matching paths and methods should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          id: fc.integer({ min: 1, max: 999999 }),
          method: fc.constantFrom('GET', 'PUT', 'DELETE', 'PATCH')
        }),
        ({ basePath, id, method }) => {
          const pathWithId = `${basePath}/${id}`;
          const pathWithParam = `${basePath}/:id`;
          
          const result = pathsMatchWithReason(pathWithId, pathWithParam, method, method);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that routes with matching paths and parameters do not match when methods differ
   */
  test('for any routes with parameters, matching paths but different methods should not match', () => {
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
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that method matching is case-insensitive
   */
  test('for any method, case variations should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
          caseVariation: fc.constantFrom('upper', 'lower', 'mixed')
        }),
        ({ path, method, caseVariation }) => {
          let method2;
          if (caseVariation === 'upper') {
            method2 = method.toUpperCase();
          } else if (caseVariation === 'lower') {
            method2 = method.toLowerCase();
          } else {
            // Mixed case like "Get", "Post"
            method2 = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
          }
          
          const result = pathsMatchWithReason(path, path, method, method2);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that when methods are not provided, paths still match based on path alone
   */
  test('for any matching paths without methods, they should match', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects', '/api/users'),
        (path) => {
          const result = pathsMatchWithReason(path, path);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that complex paths with multiple parameters match when methods match
   */
  test('for any complex paths with multiple parameters and matching methods, they should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          id1: fc.integer({ min: 1, max: 999999 }),
          id2: fc.integer({ min: 1, max: 999999 }),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE')
        }),
        ({ id1, id2, method }) => {
          const pathWithIds = `/api/tasks/${id1}/comments/${id2}`;
          const pathWithParams = `/api/tasks/:taskId/comments/:commentId`;
          
          const result = pathsMatchWithReason(pathWithIds, pathWithParams, method, method);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
