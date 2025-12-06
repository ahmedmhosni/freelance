/**
 * Property-Based Test: Query Parameter Independence
 * 
 * **Feature: route-matching-improvement, Property 3: Query parameter independence**
 * 
 * For any path with query parameters, when normalized, the resulting path should be 
 * identical to the same path without query parameters.
 * 
 * **Validates: Requirements 2.1, 2.4**
 */

const fc = require('fast-check');
const { normalizePath, pathsMatch } = require('../utils/pathNormalizer');

describe('Property 3: Query parameter independence', () => {
  /**
   * Test that normalization removes query parameters
   */
  test('for any path with query parameters, normalization should produce same result as without', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom(
            '/api/tasks',
            '/api/invoices',
            '/api/clients',
            '/api/projects',
            '/api/time-tracking'
          ),
          queryParams: fc.array(
            fc.record({
              key: fc.constantFrom('status', 'page', 'limit', 'sort', 'filter', 'search'),
              value: fc.oneof(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.integer({ min: 1, max: 100 }).map(n => n.toString())
              )
            }),
            { minLength: 1, maxLength: 5 }
          )
        }),
        ({ basePath, queryParams }) => {
          // Build query string
          const queryString = queryParams
            .map(({ key, value }) => `${key}=${value}`)
            .join('&');
          
          const pathWithQuery = `${basePath}?${queryString}`;
          const pathWithoutQuery = basePath;
          
          const normalizedWithQuery = normalizePath(pathWithQuery);
          const normalizedWithoutQuery = normalizePath(pathWithoutQuery);
          
          expect(normalizedWithQuery).toBe(normalizedWithoutQuery);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with query parameters match paths without them
   */
  test('for any path, version with query parameters should match version without', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom(
            '/api/tasks',
            '/api/invoices',
            '/api/clients',
            '/api/projects'
          ),
          queryString: fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => !s.includes('#')) // Exclude hash to avoid conflicts
        }),
        ({ basePath, queryString }) => {
          const pathWithQuery = `${basePath}?${queryString}`;
          const pathWithoutQuery = basePath;
          
          expect(pathsMatch(pathWithQuery, pathWithoutQuery)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that multiple query parameters are all removed
   */
  test('for any path with multiple query parameters, all should be removed', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          param1: fc.string({ minLength: 1, maxLength: 10 }),
          value1: fc.string({ minLength: 1, maxLength: 10 }),
          param2: fc.string({ minLength: 1, maxLength: 10 }),
          value2: fc.string({ minLength: 1, maxLength: 10 }),
          param3: fc.string({ minLength: 1, maxLength: 10 }),
          value3: fc.string({ minLength: 1, maxLength: 10 })
        }),
        ({ basePath, param1, value1, param2, value2, param3, value3 }) => {
          const pathWithMultipleParams = `${basePath}?${param1}=${value1}&${param2}=${value2}&${param3}=${value3}`;
          const normalized = normalizePath(pathWithMultipleParams);
          
          // Normalized path should not contain '?'
          expect(normalized).not.toContain('?');
          // Normalized path should equal the base path
          expect(normalized).toBe(normalizePath(basePath));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that query parameters with special characters are handled
   */
  test('for any path with query parameters containing special characters, normalization should work', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          queryValue: fc.constantFrom(
            'status=active&completed',
            'search=hello world',
            'filter=name:john',
            'sort=created_at:desc'
          )
        }),
        ({ basePath, queryValue }) => {
          const pathWithQuery = `${basePath}?${queryValue}`;
          const normalized = normalizePath(pathWithQuery);
          
          expect(normalized).toBe(normalizePath(basePath));
          expect(normalized).not.toContain('?');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that empty query parameters are handled
   */
  test('for any path with empty query parameter, normalization should work', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
        (basePath) => {
          const pathWithEmptyQuery = `${basePath}?`;
          const normalized = normalizePath(pathWithEmptyQuery);
          
          expect(normalized).toBe(normalizePath(basePath));
          expect(normalized).not.toContain('?');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with both query parameters and path parameters match correctly
   */
  test('for any path with both path and query parameters, matching should work', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          id: fc.integer({ min: 1, max: 999999 }),
          queryParam: fc.string({ minLength: 1, maxLength: 20 })
        }),
        ({ basePath, id, queryParam }) => {
          const frontendPath = `${basePath}/${id}?${queryParam}`;
          const backendPath = `${basePath}/:id`;
          
          expect(pathsMatch(frontendPath, backendPath)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that query parameters don't affect path structure comparison
   */
  test('for any two different paths, query parameters should not make them match', () => {
    fc.assert(
      fc.property(
        fc.record({
          path1: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          path2: fc.constantFrom('/api/projects', '/api/users', '/api/reports'),
          queryString: fc.string({ minLength: 1, maxLength: 30 })
        }).filter(({ path1, path2 }) => path1 !== path2),
        ({ path1, path2, queryString }) => {
          const path1WithQuery = `${path1}?${queryString}`;
          const path2WithQuery = `${path2}?${queryString}`;
          
          // Different paths should not match even with same query parameters
          expect(pathsMatch(path1WithQuery, path2WithQuery)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that hash fragments are also removed along with query parameters
   */
  test('for any path with both query parameters and hash, both should be removed', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients'),
          queryString: fc.string({ minLength: 1, maxLength: 20 }),
          hashFragment: fc.string({ minLength: 1, maxLength: 20 })
        }),
        ({ basePath, queryString, hashFragment }) => {
          const pathWithQueryAndHash = `${basePath}?${queryString}#${hashFragment}`;
          const normalized = normalizePath(pathWithQueryAndHash);
          
          expect(normalized).toBe(normalizePath(basePath));
          expect(normalized).not.toContain('?');
          expect(normalized).not.toContain('#');
        }
      ),
      { numRuns: 100 }
    );
  });
});
