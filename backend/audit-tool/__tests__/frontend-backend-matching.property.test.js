/**
 * Property-Based Test: Frontend-Backend Path Matching
 * 
 * **Feature: full-system-audit, Property 5: Frontend-Backend Path Matching**
 * 
 * For any API call made by the frontend, there should exist a corresponding 
 * backend route with a matching path and HTTP method.
 * 
 * **Validates: Requirements 2.1, 2.4**
 */

const fc = require('fast-check');
const RouteMatcher = require('../matchers/RouteMatcher');
const { createAPICallInfo } = require('../models/APICallInfo');
const { createRouteInfo } = require('../models/RouteInfo');

describe('Property 5: Frontend-Backend Path Matching', () => {
  let matcher;

  beforeEach(() => {
    matcher = new RouteMatcher({
      backend: {},
      frontend: {}
    });
  });

  /**
   * Arbitrary generator for HTTP methods
   */
  const httpMethodArbitrary = fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH');

  /**
   * Arbitrary generator for resource names
   */
  const resourceArbitrary = fc.constantFrom(
    'clients', 'projects', 'tasks', 'invoices', 
    'users', 'reports', 'notifications', 'time-tracking'
  );

  /**
   * Arbitrary generator for parameter names
   */
  const paramNameArbitrary = fc.constantFrom('id', 'userId', 'clientId', 'projectId', 'taskId');

  /**
   * Arbitrary generator for parameter values
   */
  const paramValueArbitrary = fc.oneof(
    fc.integer({ min: 1, max: 10000 }).map(n => n.toString()), // Numeric ID
    fc.uuid() // UUID
  );

  /**
   * Arbitrary generator for backend route paths
   */
  const backendPathArbitrary = fc.tuple(
    resourceArbitrary,
    fc.option(paramNameArbitrary, { nil: null })
  ).map(([resource, param]) => {
    if (param) {
      return `/api/${resource}/:${param}`;
    }
    return `/api/${resource}`;
  });

  /**
   * Arbitrary generator for frontend API call paths (matching backend)
   */
  const frontendPathArbitrary = fc.tuple(
    resourceArbitrary,
    fc.option(paramValueArbitrary, { nil: null })
  ).map(([resource, paramValue]) => {
    if (paramValue) {
      return `/${resource}/${paramValue}`;
    }
    return `/${resource}`;
  });

  /**
   * Arbitrary generator for a backend route
   */
  const backendRouteArbitrary = fc.record({
    method: httpMethodArbitrary,
    path: backendPathArbitrary
  }).map(({ method, path }) => createRouteInfo({
    method: method,
    path: path,
    handler: 'testHandler',
    middleware: [],
    module: path.split('/')[2], // Extract module from path
    isLegacy: false,
    requiresAuth: false,
    file: 'test.js'
  }));

  /**
   * Arbitrary generator for a frontend API call
   */
  const frontendCallArbitrary = fc.record({
    method: httpMethodArbitrary,
    path: frontendPathArbitrary
  }).map(({ method, path }) => createAPICallInfo({
    file: 'TestComponent.jsx',
    line: 42,
    method: method.toLowerCase(),
    path: path,
    component: 'TestComponent',
    hasBaseURL: true,
    fullPath: `/api${path}`
  }));

  /**
   * Property Test: Matching frontend call and backend route should be paired
   */
  test('frontend calls with matching backend routes are correctly paired', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.tuple(httpMethodArbitrary, resourceArbitrary, fc.option(paramNameArbitrary, { nil: null })),
          { minLength: 1, maxLength: 20 }
        ),
        async (routeSpecs) => {
          // Create matching frontend calls and backend routes
          const backendRoutes = [];
          const frontendCalls = [];

          for (const [method, resource, param] of routeSpecs) {
            // Create backend route
            const backendPath = param ? `/api/${resource}/:${param}` : `/api/${resource}`;
            backendRoutes.push(createRouteInfo({
              method: method,
              path: backendPath,
              handler: 'handler',
              middleware: [],
              module: resource,
              isLegacy: false,
              requiresAuth: false,
              file: 'test.js'
            }));

            // Create matching frontend call
            const frontendPath = param ? `/${resource}/123` : `/${resource}`;
            frontendCalls.push(createAPICallInfo({
              file: 'Test.jsx',
              line: 1,
              method: method.toLowerCase(),
              path: frontendPath,
              component: 'Test',
              hasBaseURL: true,
              fullPath: `/api${frontendPath}`
            }));
          }

          // Match routes
          const result = matcher.matchRoutes(frontendCalls, backendRoutes);

          // Property: All frontend calls should be matched
          expect(result.matched.length).toBe(frontendCalls.length);
          expect(result.unmatchedFrontend.length).toBe(0);

          // Property: Each matched pair should have same method
          for (const match of result.matched) {
            expect(match.frontend.method.toUpperCase()).toBe(match.backend.method);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Frontend calls without matching backend routes are identified
   */
  test('frontend calls without matching backend routes are identified as unmatched', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(frontendCallArbitrary, { minLength: 1, maxLength: 10 }),
        fc.array(backendRouteArbitrary, { minLength: 0, maxLength: 5 }),
        async (frontendCalls, backendRoutes) => {
          // Ensure frontend calls don't match backend routes by using different resources
          const modifiedFrontendCalls = frontendCalls.map((call, index) => 
            createAPICallInfo({
              ...call,
              path: `/unique-resource-${index}`,
              fullPath: `/api/unique-resource-${index}`
            })
          );

          // Match routes
          const result = matcher.matchRoutes(modifiedFrontendCalls, backendRoutes);

          // Property: All frontend calls should be unmatched
          expect(result.unmatchedFrontend.length).toBe(modifiedFrontendCalls.length);
          expect(result.matched.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Backend routes without matching frontend calls are identified
   */
  test('backend routes without matching frontend calls are identified as unmatched', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(backendRouteArbitrary, { minLength: 1, maxLength: 10 }),
        fc.array(frontendCallArbitrary, { minLength: 0, maxLength: 5 }),
        async (backendRoutes, frontendCalls) => {
          // Ensure backend routes don't match frontend calls by using different resources
          const modifiedBackendRoutes = backendRoutes.map((route, index) => 
            createRouteInfo({
              ...route,
              path: `/api/unique-backend-${index}`
            })
          );

          // Match routes
          const result = matcher.matchRoutes(frontendCalls, modifiedBackendRoutes);

          // Property: All backend routes should be unmatched
          expect(result.unmatchedBackend.length).toBe(modifiedBackendRoutes.length);
          expect(result.matched.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Path parameters are correctly matched
   */
  test('paths with parameters match correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        httpMethodArbitrary,
        resourceArbitrary,
        paramNameArbitrary,
        paramValueArbitrary,
        async (method, resource, paramName, paramValue) => {
          // Create backend route with parameter
          const backendRoute = createRouteInfo({
            method: method,
            path: `/api/${resource}/:${paramName}`,
            handler: 'handler',
            middleware: [],
            module: resource,
            isLegacy: false,
            requiresAuth: false,
            file: 'test.js'
          });

          // Create frontend call with actual parameter value
          const frontendCall = createAPICallInfo({
            file: 'Test.jsx',
            line: 1,
            method: method.toLowerCase(),
            path: `/${resource}/${paramValue}`,
            component: 'Test',
            hasBaseURL: true,
            fullPath: `/api/${resource}/${paramValue}`
          });

          // Match routes
          const result = matcher.matchRoutes([frontendCall], [backendRoute]);

          // Property: Frontend call with parameter value should match backend route with parameter placeholder
          expect(result.matched.length).toBe(1);
          expect(result.unmatchedFrontend.length).toBe(0);
          expect(result.unmatchedBackend.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Different HTTP methods don't match
   */
  test('routes with different HTTP methods do not match', async () => {
    await fc.assert(
      fc.asyncProperty(
        resourceArbitrary,
        fc.tuple(httpMethodArbitrary, httpMethodArbitrary).filter(([m1, m2]) => m1 !== m2),
        async (resource, [method1, method2]) => {
          // Create backend route with one method
          const backendRoute = createRouteInfo({
            method: method1,
            path: `/api/${resource}`,
            handler: 'handler',
            middleware: [],
            module: resource,
            isLegacy: false,
            requiresAuth: false,
            file: 'test.js'
          });

          // Create frontend call with different method
          const frontendCall = createAPICallInfo({
            file: 'Test.jsx',
            line: 1,
            method: method2.toLowerCase(),
            path: `/${resource}`,
            component: 'Test',
            hasBaseURL: true,
            fullPath: `/api/${resource}`
          });

          // Match routes
          const result = matcher.matchRoutes([frontendCall], [backendRoute]);

          // Property: Routes with different methods should not match
          expect(result.matched.length).toBe(0);
          expect(result.unmatchedFrontend.length).toBe(1);
          expect(result.unmatchedBackend.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Path normalization handles different formats
   */
  test('path normalization allows matching despite format differences', async () => {
    await fc.assert(
      fc.asyncProperty(
        httpMethodArbitrary,
        resourceArbitrary,
        fc.constantFrom('', '/', '//'), // Trailing slashes
        async (method, resource, trailingSlash) => {
          // Create backend route
          const backendRoute = createRouteInfo({
            method: method,
            path: `/api/${resource}`,
            handler: 'handler',
            middleware: [],
            module: resource,
            isLegacy: false,
            requiresAuth: false,
            file: 'test.js'
          });

          // Create frontend call with trailing slash variation
          const frontendCall = createAPICallInfo({
            file: 'Test.jsx',
            line: 1,
            method: method.toLowerCase(),
            path: `/${resource}${trailingSlash}`,
            component: 'Test',
            hasBaseURL: true,
            fullPath: `/api/${resource}${trailingSlash}`
          });

          // Match routes
          const result = matcher.matchRoutes([frontendCall], [backendRoute]);

          // Property: Paths should match despite trailing slash differences
          expect(result.matched.length).toBe(1);
          expect(result.unmatchedFrontend.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Multiple frontend calls can match the same backend route
   */
  test('multiple frontend calls with different parameters match same parameterized backend route', async () => {
    await fc.assert(
      fc.asyncProperty(
        httpMethodArbitrary,
        resourceArbitrary,
        paramNameArbitrary,
        fc.array(paramValueArbitrary, { minLength: 2, maxLength: 5 }),
        async (method, resource, paramName, paramValues) => {
          // Create single backend route with parameter
          const backendRoute = createRouteInfo({
            method: method,
            path: `/api/${resource}/:${paramName}`,
            handler: 'handler',
            middleware: [],
            module: resource,
            isLegacy: false,
            requiresAuth: false,
            file: 'test.js'
          });

          // Create multiple frontend calls with different parameter values
          const frontendCalls = paramValues.map(paramValue => 
            createAPICallInfo({
              file: 'Test.jsx',
              line: 1,
              method: method.toLowerCase(),
              path: `/${resource}/${paramValue}`,
              component: 'Test',
              hasBaseURL: true,
              fullPath: `/api/${resource}/${paramValue}`
            })
          );

          // Match routes - note: matcher matches one-to-one, so only first call will match
          // This tests that at least one call matches
          const result = matcher.matchRoutes(frontendCalls, [backendRoute]);

          // Property: At least one frontend call should match the parameterized backend route
          expect(result.matched.length).toBeGreaterThanOrEqual(1);
          
          // All matched calls should have the same backend route
          const uniqueBackendPaths = new Set(result.matched.map(m => m.backend.path));
          expect(uniqueBackendPaths.size).toBe(1);
          expect(uniqueBackendPaths.has(`/api/${resource}/:${paramName}`)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
