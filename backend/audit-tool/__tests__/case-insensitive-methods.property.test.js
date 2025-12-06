/**
 * Property-Based Test: Case-Insensitive Method Comparison
 * 
 * **Feature: route-matching-improvement, Property 6: Case-insensitive method comparison**
 * 
 * For any HTTP method string, when compared with the same method in different case 
 * (e.g., "GET" vs "get" vs "Get"), they should be considered equal.
 * 
 * **Validates: Requirements 3.3**
 */

const fc = require('fast-check');
const { pathsMatchWithReason } = require('../utils/pathNormalizer');

describe('Property 6: Case-insensitive method comparison', () => {
  /**
   * Test that uppercase and lowercase methods match
   */
  test('for any method, uppercase and lowercase versions should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')
        }),
        ({ path, method }) => {
          const upperMethod = method.toUpperCase();
          const lowerMethod = method.toLowerCase();
          
          const result = pathsMatchWithReason(path, path, upperMethod, lowerMethod);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that mixed case methods match
   */
  test('for any method, mixed case versions should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
        }),
        ({ path, method }) => {
          const upperMethod = method.toUpperCase();
          const mixedMethod = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
          
          const result = pathsMatchWithReason(path, path, upperMethod, mixedMethod);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that all case variations of GET match
   */
  test('for any path, all case variations of GET should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          caseVariation: fc.constantFrom('GET', 'get', 'Get', 'gEt', 'geT', 'GEt')
        }),
        ({ path, caseVariation }) => {
          const result = pathsMatchWithReason(path, path, 'GET', caseVariation);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that all case variations of POST match
   */
  test('for any path, all case variations of POST should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          caseVariation: fc.constantFrom('POST', 'post', 'Post', 'pOst', 'poSt', 'POst')
        }),
        ({ path, caseVariation }) => {
          const result = pathsMatchWithReason(path, path, 'POST', caseVariation);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that all case variations of PUT match
   */
  test('for any path, all case variations of PUT should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          caseVariation: fc.constantFrom('PUT', 'put', 'Put', 'pUt', 'puT', 'PUt')
        }),
        ({ path, caseVariation }) => {
          const result = pathsMatchWithReason(path, path, 'PUT', caseVariation);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that all case variations of DELETE match
   */
  test('for any path, all case variations of DELETE should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          caseVariation: fc.constantFrom('DELETE', 'delete', 'Delete', 'dElete', 'DElete')
        }),
        ({ path, caseVariation }) => {
          const result = pathsMatchWithReason(path, path, 'DELETE', caseVariation);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that case-insensitive matching works with parameters
   */
  test('for any routes with parameters, case-insensitive methods should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          id: fc.integer({ min: 1, max: 999999 }),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
          caseVariation: fc.constantFrom('upper', 'lower', 'mixed')
        }),
        ({ basePath, id, method, caseVariation }) => {
          const pathWithId = `${basePath}/${id}`;
          const pathWithParam = `${basePath}/:id`;
          
          let method2;
          if (caseVariation === 'upper') {
            method2 = method.toUpperCase();
          } else if (caseVariation === 'lower') {
            method2 = method.toLowerCase();
          } else {
            method2 = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
          }
          
          const result = pathsMatchWithReason(pathWithId, pathWithParam, method, method2);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that case-insensitive matching works with complex paths
   */
  test('for any complex paths, case-insensitive methods should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          id1: fc.integer({ min: 1, max: 999999 }),
          id2: fc.integer({ min: 1, max: 999999 }),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
          caseVariation: fc.constantFrom('upper', 'lower', 'mixed')
        }),
        ({ id1, id2, method, caseVariation }) => {
          const pathWithIds = `/api/tasks/${id1}/comments/${id2}`;
          const pathWithParams = `/api/tasks/:taskId/comments/:commentId`;
          
          let method2;
          if (caseVariation === 'upper') {
            method2 = method.toUpperCase();
          } else if (caseVariation === 'lower') {
            method2 = method.toLowerCase();
          } else {
            method2 = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
          }
          
          const result = pathsMatchWithReason(pathWithIds, pathWithParams, method, method2);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that case-insensitive matching works with query parameters
   */
  test('for any paths with query parameters, case-insensitive methods should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          queryParam: fc.constantFrom('status=active', 'page=1', 'limit=10'),
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
          caseVariation: fc.constantFrom('upper', 'lower', 'mixed')
        }),
        ({ basePath, queryParam, method, caseVariation }) => {
          const pathWithQuery = `${basePath}?${queryParam}`;
          
          let method2;
          if (caseVariation === 'upper') {
            method2 = method.toUpperCase();
          } else if (caseVariation === 'lower') {
            method2 = method.toLowerCase();
          } else {
            method2 = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
          }
          
          const result = pathsMatchWithReason(pathWithQuery, basePath, method, method2);
          
          expect(result.match).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
