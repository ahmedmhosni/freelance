/**
 * Property-Based Test: Middleware Application Consistency
 * 
 * **Feature: full-system-audit, Property 30: Middleware Application Consistency**
 * 
 * For any two routes in the same module with similar security requirements, 
 * they should have the same authentication middleware applied.
 * 
 * **Validates: Requirements 8.5**
 */

const fc = require('fast-check');
const { createRouteInfo } = require('../models/RouteInfo');
const ModuleStructureVerifier = require('../verifiers/ModuleStructureVerifier');

describe('Property 30: Middleware Application Consistency', () => {
  let verifier;

  beforeAll(() => {
    verifier = new ModuleStructureVerifier();
  });

  /**
   * Arbitrary generator for HTTP methods
   */
  const httpMethodArbitrary = fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH');

  /**
   * Arbitrary generator for module names
   */
  const moduleNameArbitrary = fc.constantFrom(
    'clients', 'projects', 'tasks', 'invoices', 'time-tracking', 'reports'
  );

  /**
   * Arbitrary generator for route paths within a module
   */
  const routePathArbitrary = fc.tuple(
    moduleNameArbitrary,
    fc.option(fc.constantFrom('id', 'status', 'details'), { nil: null })
  ).map(([module, param]) => {
    if (param) {
      return `/api/${module}/:${param}`;
    }
    return `/api/${module}`;
  });

  /**
   * Arbitrary generator for a route with authentication
   */
  const authenticatedRouteArbitrary = fc.record({
    method: httpMethodArbitrary,
    path: routePathArbitrary,
    handler: fc.constant('handler'),
    middleware: fc.constant(['authenticateToken']),
    module: moduleNameArbitrary,
    isLegacy: fc.constant(false),
    requiresAuth: fc.constant(true),
    file: fc.constant('test.js')
  });

  /**
   * Arbitrary generator for a route without authentication
   */
  const unauthenticatedRouteArbitrary = fc.record({
    method: httpMethodArbitrary,
    path: routePathArbitrary,
    handler: fc.constant('handler'),
    middleware: fc.constant([]),
    module: moduleNameArbitrary,
    isLegacy: fc.constant(false),
    requiresAuth: fc.constant(false),
    file: fc.constant('test.js')
  });

  /**
   * Property Test: Routes in same module with same CRUD operation have consistent auth
   */
  test('CRUD routes in same module have consistent authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        moduleNameArbitrary,
        fc.boolean(),
        async (moduleName, requiresAuth) => {
          // Create CRUD routes for the same module
          const crudMethods = ['GET', 'POST', 'PUT', 'DELETE'];
          const routes = crudMethods.map(method => 
            createRouteInfo({
              method,
              path: `/api/${moduleName}`,
              handler: 'handler',
              middleware: requiresAuth ? ['authenticateToken'] : [],
              module: moduleName,
              isLegacy: false,
              requiresAuth,
              file: 'test.js'
            })
          );

          const result = verifier.verifyMiddlewareConsistency(routes);

          // Property: All CRUD routes in same module should have same auth status
          const authStatuses = routes.map(r => r.requiresAuth);
          const allSame = authStatuses.every(val => val === authStatuses[0]);
          
          if (allSame) {
            // If all routes have same auth, no inconsistency issues should be reported
            const hasInconsistencyIssue = result.issues.some(
              i => i.type === 'INCONSISTENT_MIDDLEWARE' && i.location === moduleName
            );
            expect(hasInconsistencyIssue).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Inconsistent auth in same module is detected
   */
  test('inconsistent authentication in same module is detected', async () => {
    await fc.assert(
      fc.asyncProperty(
        moduleNameArbitrary,
        async (moduleName) => {
          // Create routes with mixed authentication
          const routes = [
            createRouteInfo({
              method: 'GET',
              path: `/api/${moduleName}`,
              handler: 'handler',
              middleware: ['authenticateToken'],
              module: moduleName,
              isLegacy: false,
              requiresAuth: true,
              file: 'test.js'
            }),
            createRouteInfo({
              method: 'POST',
              path: `/api/${moduleName}`,
              handler: 'handler',
              middleware: [],
              module: moduleName,
              isLegacy: false,
              requiresAuth: false,
              file: 'test.js'
            }),
            createRouteInfo({
              method: 'PUT',
              path: `/api/${moduleName}/:id`,
              handler: 'handler',
              middleware: ['authenticateToken'],
              module: moduleName,
              isLegacy: false,
              requiresAuth: true,
              file: 'test.js'
            }),
            createRouteInfo({
              method: 'DELETE',
              path: `/api/${moduleName}/:id`,
              handler: 'handler',
              middleware: [],
              module: moduleName,
              isLegacy: false,
              requiresAuth: false,
              file: 'test.js'
            })
          ];

          const result = verifier.verifyMiddlewareConsistency(routes);

          // Property: Inconsistent auth should be flagged
          expect(result.passed).toBe(false);
          expect(result.issues.length).toBeGreaterThan(0);
          
          const hasInconsistencyIssue = result.issues.some(
            i => i.type === 'INCONSISTENT_MIDDLEWARE' && i.location === moduleName
          );
          expect(hasInconsistencyIssue).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property Test: Protected routes are correctly identified
   */
  test('protected routes are correctly identified in analysis', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(authenticatedRouteArbitrary, { minLength: 1, maxLength: 10 }),
        async (routes) => {
          const routeInfos = routes.map(r => createRouteInfo(r));
          const result = verifier.verifyMiddlewareConsistency(routeInfos);

          // Property: All authenticated routes should appear in protectedRoutes
          expect(result.analysis.protectedRoutes.length).toBe(routeInfos.length);
          
          for (const route of routeInfos) {
            const found = result.analysis.protectedRoutes.some(
              pr => pr.path === route.path && pr.method === route.method
            );
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Unprotected routes are correctly identified
   */
  test('unprotected routes are correctly identified in analysis', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(unauthenticatedRouteArbitrary, { minLength: 1, maxLength: 10 }),
        async (routes) => {
          const routeInfos = routes.map(r => createRouteInfo(r));
          const result = verifier.verifyMiddlewareConsistency(routeInfos);

          // Property: All unauthenticated routes should appear in unprotectedRoutes
          expect(result.analysis.unprotectedRoutes.length).toBe(routeInfos.length);
          
          for (const route of routeInfos) {
            const found = result.analysis.unprotectedRoutes.some(
              pr => pr.path === route.path && pr.method === route.method
            );
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Mixed auth in module creates inconsistency entry
   */
  test('modules with mixed auth have inconsistency analysis entry', async () => {
    await fc.assert(
      fc.asyncProperty(
        moduleNameArbitrary,
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        async (moduleName, authCount, noAuthCount) => {
          // Create routes with mixed authentication
          const routes = [];
          
          // Add authenticated routes
          for (let i = 0; i < authCount; i++) {
            routes.push(createRouteInfo({
              method: 'GET',
              path: `/api/${moduleName}/auth${i}`,
              handler: 'handler',
              middleware: ['authenticateToken'],
              module: moduleName,
              isLegacy: false,
              requiresAuth: true,
              file: 'test.js'
            }));
          }
          
          // Add unauthenticated routes
          for (let i = 0; i < noAuthCount; i++) {
            routes.push(createRouteInfo({
              method: 'GET',
              path: `/api/${moduleName}/noauth${i}`,
              handler: 'handler',
              middleware: [],
              module: moduleName,
              isLegacy: false,
              requiresAuth: false,
              file: 'test.js'
            }));
          }

          const result = verifier.verifyMiddlewareConsistency(routes);

          // Property: Module with mixed auth should have inconsistency entry
          const inconsistency = result.analysis.inconsistencies.find(
            inc => inc.module === moduleName && inc.type === 'MIXED_AUTH'
          );
          
          expect(inconsistency).toBeDefined();
          expect(inconsistency.protectedRoutes.length).toBe(authCount);
          expect(inconsistency.unprotectedRoutes.length).toBe(noAuthCount);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property Test: Empty routes array returns valid result
   */
  test('empty routes array returns valid result structure', () => {
    const result = verifier.verifyMiddlewareConsistency([]);

    // Property: Result should have valid structure even with no routes
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('analysis');
    expect(result.analysis).toHaveProperty('protectedRoutes');
    expect(result.analysis).toHaveProperty('unprotectedRoutes');
    expect(result.analysis).toHaveProperty('inconsistencies');
    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.analysis.protectedRoutes)).toBe(true);
    expect(Array.isArray(result.analysis.unprotectedRoutes)).toBe(true);
    expect(Array.isArray(result.analysis.inconsistencies)).toBe(true);
  });

  /**
   * Property Test: Routes without module are handled gracefully
   */
  test('routes without module are handled gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            method: httpMethodArbitrary,
            path: fc.constant('/api/test'),
            handler: fc.constant('handler'),
            middleware: fc.constant([]),
            module: fc.constant(null),
            isLegacy: fc.constant(true),
            requiresAuth: fc.constant(false),
            file: fc.constant('test.js')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (routes) => {
          const routeInfos = routes.map(r => createRouteInfo(r));
          
          // Property: Should not throw error with null modules
          expect(() => {
            verifier.verifyMiddlewareConsistency(routeInfos);
          }).not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property Test: Verification is deterministic
   */
  test('middleware consistency verification is deterministic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.oneof(authenticatedRouteArbitrary, unauthenticatedRouteArbitrary),
          { minLength: 1, maxLength: 10 }
        ),
        async (routes) => {
          const routeInfos = routes.map(r => createRouteInfo(r));
          
          const result1 = verifier.verifyMiddlewareConsistency(routeInfos);
          const result2 = verifier.verifyMiddlewareConsistency(routeInfos);

          // Property: Same input should produce same output
          expect(result1.passed).toBe(result2.passed);
          expect(result1.issues.length).toBe(result2.issues.length);
          expect(result1.analysis.protectedRoutes.length).toBe(result2.analysis.protectedRoutes.length);
          expect(result1.analysis.unprotectedRoutes.length).toBe(result2.analysis.unprotectedRoutes.length);
          expect(result1.analysis.inconsistencies.length).toBe(result2.analysis.inconsistencies.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: All routes are accounted for in analysis
   */
  test('all routes are accounted for in protected or unprotected lists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.oneof(authenticatedRouteArbitrary, unauthenticatedRouteArbitrary),
          { minLength: 1, maxLength: 15 }
        ),
        async (routes) => {
          const routeInfos = routes.map(r => createRouteInfo(r));
          const result = verifier.verifyMiddlewareConsistency(routeInfos);

          // Count routes with modules (routes without modules are skipped)
          const routesWithModules = routeInfos.filter(r => r.module !== null);
          const totalAnalyzed = result.analysis.protectedRoutes.length + 
                               result.analysis.unprotectedRoutes.length;

          // Property: All routes with modules should be in either protected or unprotected
          expect(totalAnalyzed).toBe(routesWithModules.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Issue severity is appropriate
   */
  test('inconsistent middleware issues have appropriate severity', async () => {
    await fc.assert(
      fc.asyncProperty(
        moduleNameArbitrary,
        async (moduleName) => {
          // Create routes with inconsistent auth
          const routes = [
            createRouteInfo({
              method: 'GET',
              path: `/api/${moduleName}`,
              handler: 'handler',
              middleware: ['authenticateToken'],
              module: moduleName,
              isLegacy: false,
              requiresAuth: true,
              file: 'test.js'
            }),
            createRouteInfo({
              method: 'POST',
              path: `/api/${moduleName}`,
              handler: 'handler',
              middleware: [],
              module: moduleName,
              isLegacy: false,
              requiresAuth: false,
              file: 'test.js'
            })
          ];

          const result = verifier.verifyMiddlewareConsistency(routes);

          // Property: Inconsistency issues should have MEDIUM severity
          const inconsistencyIssues = result.issues.filter(
            i => i.type === 'INCONSISTENT_MIDDLEWARE'
          );
          
          for (const issue of inconsistencyIssues) {
            expect(issue.severity).toBe('MEDIUM');
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
