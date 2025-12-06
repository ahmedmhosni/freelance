/**
 * Property-Based Test: Exact Match Preservation
 * 
 * **Feature: route-matching-improvement, Property 2: Exact match preservation**
 * 
 * For any two paths without parameters, when compared, they should match if and only if 
 * they are identical after normalization (ignoring trailing slashes, query parameters, 
 * and case differences in /api prefix).
 * 
 * **Validates: Requirements 1.5**
 */

const fc = require('fast-check');
const { pathsMatch, normalizePath } = require('../utils/pathNormalizer');

describe('Property 2: Exact match preservation', () => {
  /**
   * Test that identical paths without parameters match
   */
  test('for any path without parameters, it should match itself', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/api/tasks',
          '/api/invoices',
          '/api/clients',
          '/api/projects',
          '/api/time-tracking',
          '/api/notifications',
          '/api/reports',
          '/api/auth/login',
          '/api/auth/logout',
          '/api/dashboard/stats'
        ),
        (path) => {
          expect(pathsMatch(path, path)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with trailing slashes match paths without
   */
  test('for any path, versions with and without trailing slash should match', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/api/tasks',
          '/api/invoices',
          '/api/clients',
          '/api/projects',
          '/api/auth/login'
        ),
        (path) => {
          const pathWithSlash = path + '/';
          const pathWithoutSlash = path;
          
          expect(pathsMatch(pathWithSlash, pathWithoutSlash)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that different paths without parameters don't match
   */
  test('for any two different paths without parameters, they should not match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path1: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          path2: fc.constantFrom('/api/users', '/api/reports', '/api/notifications', '/api/dashboard')
        }).filter(({ path1, path2 }) => {
          // Ensure paths are actually different after normalization
          return normalizePath(path1) !== normalizePath(path2);
        }),
        ({ path1, path2 }) => {
          expect(pathsMatch(path1, path2)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with different segment counts don't match
   */
  test('for any two paths with different number of segments, they should not match', () => {
    fc.assert(
      fc.property(
        fc.record({
          shortPath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          longPath: fc.constantFrom('/api/tasks/active', '/api/invoices/pending', '/api/clients/archived')
        }),
        ({ shortPath, longPath }) => {
          expect(pathsMatch(shortPath, longPath)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that normalization is idempotent
   */
  test('for any path, normalizing twice should produce same result as normalizing once', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/api/tasks/',
          '/api/invoices//',
          '//api//clients',
          '/api/projects?status=active',
          '/api/tasks#section'
        ),
        (path) => {
          const normalized1 = normalizePath(path);
          const normalized2 = normalizePath(normalized1);
          
          expect(normalized1).toBe(normalized2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with /api prefix match paths without when appropriate
   */
  test('for any path, /api prefix variations should be handled consistently', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('tasks', 'invoices', 'clients', 'projects', 'reports'),
        (resource) => {
          const pathWithApi = `/api/${resource}`;
          const pathWithoutApi = `/${resource}`;
          
          // These should match because pathsMatch tries both with and without /api
          expect(pathsMatch(pathWithApi, pathWithoutApi)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that multiple slashes are normalized to single slash
   */
  test('for any path with multiple slashes, normalization should reduce to single slashes', () => {
    fc.assert(
      fc.property(
        fc.record({
          segment1: fc.constantFrom('api', 'tasks', 'invoices'),
          segment2: fc.constantFrom('active', 'pending', 'completed'),
          slashCount1: fc.integer({ min: 1, max: 5 }),
          slashCount2: fc.integer({ min: 1, max: 5 })
        }),
        ({ segment1, segment2, slashCount1, slashCount2 }) => {
          const slashes1 = '/'.repeat(slashCount1);
          const slashes2 = '/'.repeat(slashCount2);
          const pathWithMultipleSlashes = `${slashes1}${segment1}${slashes2}${segment2}`;
          const pathWithSingleSlashes = `/${segment1}/${segment2}`;
          
          expect(pathsMatch(pathWithMultipleSlashes, pathWithSingleSlashes)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths are case-sensitive except for /api prefix
   */
  test('for any path, case should matter except for /api prefix', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { path1: '/api/tasks', path2: '/api/Tasks' },
          { path1: '/api/invoices', path2: '/api/Invoices' },
          { path1: '/api/clients', path2: '/api/Clients' }
        ),
        ({ path1, path2 }) => {
          // These should NOT match because the resource name has different case
          expect(pathsMatch(path1, path2)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that empty or invalid paths are handled gracefully
   */
  test('for any empty or null path, matching should handle gracefully', () => {
    const validPath = '/api/tasks';
    
    expect(pathsMatch('', validPath)).toBe(false);
    expect(pathsMatch(validPath, '')).toBe(false);
    expect(pathsMatch('', '')).toBe(false);
    expect(pathsMatch(null, validPath)).toBe(false);
    expect(pathsMatch(validPath, null)).toBe(false);
  });

  /**
   * Test that paths with only static segments match exactly
   */
  test('for any path with only static segments, exact match is required', () => {
    fc.assert(
      fc.property(
        fc.record({
          base: fc.constantFrom('/api', '/v1', '/v2'),
          resource: fc.constantFrom('tasks', 'invoices', 'clients', 'projects'),
          action: fc.constantFrom('list', 'create', 'update', 'delete')
        }),
        ({ base, resource, action }) => {
          const path1 = `${base}/${resource}/${action}`;
          const path2 = `${base}/${resource}/${action}`;
          
          // Identical paths should match
          expect(pathsMatch(path1, path2)).toBe(true);
          
          // Different action should not match
          const differentAction = action === 'list' ? 'create' : 'list';
          const path3 = `${base}/${resource}/${differentAction}`;
          expect(pathsMatch(path1, path3)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
