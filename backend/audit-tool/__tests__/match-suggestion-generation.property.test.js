/**
 * Property-Based Tests for Match Suggestion Generation
 * 
 * **Feature: route-matching-improvement, Property 8: Match suggestion generation**
 * **Validates: Requirements 4.3**
 * 
 * Property: For any unmatched route, if there exists another route with similarity 
 * score > 0.7, a suggestion should be generated.
 */

const fc = require('fast-check');
const RouteMatcher = require('../matchers/RouteMatcher');

describe('Property 8: Match suggestion generation', () => {
  const matcher = new RouteMatcher({});

  /**
   * Arbitrary for generating similar API paths
   */
  const similarPathPairArbitrary = fc.tuple(
    fc.constantFrom('tasks', 'projects', 'invoices', 'clients', 'time-tracking'),
    fc.constantFrom('123', '456', '789', ':id', ':taskId', ':projectId')
  ).map(([base, param]) => ({
    frontend: `/api/${base}/${param}`,
    backend: `/api/${base}/:id`
  }));

  /**
   * Arbitrary for generating API call info
   */
  const apiCallArbitrary = (path) => fc.record({
    method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
    path: fc.constant(path),
    fullPath: fc.constant(path),
    file: fc.constant('test.js'),
    line: fc.nat(1000),
    hasBaseURL: fc.boolean()
  });

  /**
   * Arbitrary for generating route info
   */
  const routeInfoArbitrary = (path, method = null) => fc.record({
    method: method ? fc.constant(method) : fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
    path: fc.constant(path),
    file: fc.constant('routes.js'),
    line: fc.nat(1000),
    controller: fc.constant('TestController'),
    handler: fc.constant('testHandler')
  });

  test('suggestions are generated for routes with similarity > 0.7', () => {
    fc.assert(
      fc.property(
        similarPathPairArbitrary,
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
        (pathPair, method) => {
          const frontendCall = {
            method: method,
            path: pathPair.frontend,
            fullPath: pathPair.frontend,
            file: 'test.js',
            line: 1,
            hasBaseURL: false
          };
          
          const backendRoute = {
            method: method,
            path: pathPair.backend,
            file: 'routes.js',
            line: 1,
            controller: 'TestController',
            handler: 'testHandler'
          };

          const suggestions = matcher.suggestMatches([frontendCall], [backendRoute]);

          // Should generate at least one suggestion for similar paths
          expect(suggestions.length).toBeGreaterThanOrEqual(1);

          // Each suggestion should have required fields
          suggestions.forEach(suggestion => {
            expect(suggestion).toHaveProperty('frontend');
            expect(suggestion).toHaveProperty('backend');
            expect(suggestion).toHaveProperty('similarity');
            expect(suggestion).toHaveProperty('reason');
            expect(suggestion).toHaveProperty('suggestedAction');

            // Similarity should be > 0.7
            expect(suggestion.similarity).toBeGreaterThan(0.7);
            expect(suggestion.similarity).toBeLessThanOrEqual(1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('no suggestions are generated for completely different routes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
        (method) => {
          const frontendCall = {
            method: method,
            path: '/api/tasks',
            fullPath: '/api/tasks',
            file: 'test.js',
            line: 1,
            hasBaseURL: false
          };

          const backendRoute = {
            method: method,
            path: '/api/completely/different/route/structure',
            file: 'routes.js',
            line: 1,
            controller: 'TestController',
            handler: 'testHandler'
          };

          const suggestions = matcher.suggestMatches([frontendCall], [backendRoute]);

          // Should not generate suggestions for very different routes
          expect(suggestions.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('suggestions include reason and suggested action', () => {
    fc.assert(
      fc.property(
        similarPathPairArbitrary,
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
        (pathPair, frontendMethod, backendMethod) => {
          const frontendCall = {
            method: frontendMethod,
            path: pathPair.frontend,
            fullPath: pathPair.frontend,
            file: 'test.js',
            line: 1,
            hasBaseURL: false
          };
          
          const backendRoute = {
            method: backendMethod,
            path: pathPair.backend,
            file: 'routes.js',
            line: 1,
            controller: 'TestController',
            handler: 'testHandler'
          };

          const suggestions = matcher.suggestMatches([frontendCall], [backendRoute]);

          suggestions.forEach(suggestion => {
            // Reason should be a non-empty string
            expect(typeof suggestion.reason).toBe('string');
            expect(suggestion.reason.length).toBeGreaterThan(0);

            // Suggested action should be a non-empty string
            expect(typeof suggestion.suggestedAction).toBe('string');
            expect(suggestion.suggestedAction.length).toBeGreaterThan(0);

            // If methods differ, reason should mention method mismatch
            if (frontendMethod !== backendMethod) {
              expect(suggestion.reason.toLowerCase()).toContain('method');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('suggestions are sorted by similarity score (highest first)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('GET', 'POST'),
        (method) => {
          const frontendCall = {
            method: method,
            path: '/api/tasks/123',
            fullPath: '/api/tasks/123',
            file: 'test.js',
            line: 1,
            hasBaseURL: false
          };

          const backendRoutes = [
            {
              method: method,
              path: '/api/tasks/:id',
              file: 'routes.js',
              line: 1,
              controller: 'TasksController',
              handler: 'getTask'
            },
            {
              method: method,
              path: '/api/tasks/:id/comments',
              file: 'routes.js',
              line: 2,
              controller: 'TasksController',
              handler: 'getComments'
            },
            {
              method: method,
              path: '/api/projects/:id',
              file: 'routes.js',
              line: 3,
              controller: 'ProjectsController',
              handler: 'getProject'
            }
          ];

          const suggestions = matcher.suggestMatches([frontendCall], backendRoutes);

          // Check that suggestions are sorted by similarity
          for (let i = 1; i < suggestions.length; i++) {
            expect(suggestions[i - 1].similarity).toBeGreaterThanOrEqual(suggestions[i].similarity);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('empty input arrays produce empty suggestions', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Empty frontend
          expect(matcher.suggestMatches([], []).length).toBe(0);

          // Empty backend
          const frontendCall = {
            method: 'GET',
            path: '/api/tasks',
            fullPath: '/api/tasks',
            file: 'test.js',
            line: 1,
            hasBaseURL: false
          };
          expect(matcher.suggestMatches([frontendCall], []).length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
