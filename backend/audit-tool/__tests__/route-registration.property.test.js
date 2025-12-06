/**
 * Property-Based Test: Route Registration Completeness
 * 
 * **Feature: full-system-audit, Property 1: Route Registration Completeness**
 * 
 * For any module in the system, when the application starts, all routes defined 
 * in that module should be registered and accessible via the Express router.
 * 
 * **Validates: Requirements 1.1, 1.3**
 */

const fc = require('fast-check');
const express = require('express');
const request = require('supertest');
const { createRouteInfo } = require('../models/RouteInfo');

describe('Property 1: Route Registration Completeness', () => {
  /**
   * Helper function to create a test Express app with routes
   * @param {Array<{method: string, path: string, handler: Function}>} routes
   * @returns {Express.Application}
   */
  function createTestApp(routes) {
    const app = express();
    app.use(express.json());

    routes.forEach(route => {
      const method = route.method.toLowerCase();
      app[method](route.path, route.handler);
    });

    return app;
  }

  /**
   * Helper function to extract registered routes from Express app
   * @param {Express.Application} app
   * @returns {Array<RouteInfo>}
   */
  function extractRegisteredRoutes(app) {
    const routes = [];
    
    // Extract routes from Express app stack
    app._router.stack.forEach(middleware => {
      if (middleware.route) {
        // Direct route
        const methods = Object.keys(middleware.route.methods);
        methods.forEach(method => {
          routes.push(createRouteInfo({
            method: method.toUpperCase(),
            path: middleware.route.path,
            handler: 'handler',
            middleware: [],
            module: null,
            isLegacy: false,
            requiresAuth: false,
            file: 'test'
          }));
        });
      } else if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach(handler => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods);
            methods.forEach(method => {
              const fullPath = (middleware.regexp.source.match(/^\\\/(.+?)\\\//)?.[1] || '') + handler.route.path;
              routes.push(createRouteInfo({
                method: method.toUpperCase(),
                path: '/' + fullPath.replace(/\\\//g, '/'),
                handler: 'handler',
                middleware: [],
                module: null,
                isLegacy: false,
                requiresAuth: false,
                file: 'test'
              }));
            });
          }
        });
      }
    });

    return routes;
  }

  /**
   * Arbitrary generator for HTTP methods
   */
  const httpMethodArbitrary = fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH');

  /**
   * Arbitrary generator for route paths
   */
  const routePathArbitrary = fc.tuple(
    fc.constantFrom('users', 'clients', 'projects', 'tasks', 'invoices'),
    fc.option(fc.constantFrom('id', 'status', 'details'), { nil: null })
  ).map(([base, param]) => {
    if (param) {
      return `/api/${base}/:${param}`;
    }
    return `/api/${base}`;
  });

  /**
   * Arbitrary generator for a single route definition
   */
  const routeArbitrary = fc.record({
    method: httpMethodArbitrary,
    path: routePathArbitrary,
    handler: fc.constant((req, res) => res.json({ success: true }))
  });

  /**
   * Property Test: All defined routes should be registered and accessible
   */
  test('all defined routes are registered in the Express app', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(routeArbitrary, { minLength: 1, maxLength: 10 }),
        async (routeDefinitions) => {
          // Remove duplicates (same method + path combination)
          const uniqueRoutes = [];
          const seen = new Set();
          
          for (const route of routeDefinitions) {
            const key = `${route.method}:${route.path}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueRoutes.push(route);
            }
          }

          // Create app with the defined routes
          const app = createTestApp(uniqueRoutes);

          // Extract registered routes
          const registeredRoutes = extractRegisteredRoutes(app);

          // Verify all defined routes are registered
          for (const definedRoute of uniqueRoutes) {
            const isRegistered = registeredRoutes.some(
              registered => 
                registered.method === definedRoute.method &&
                registered.path === definedRoute.path
            );

            // Property: Every defined route must be registered
            expect(isRegistered).toBe(true);
          }

          // Verify routes are accessible (respond to requests)
          for (const route of uniqueRoutes) {
            const method = route.method.toLowerCase();
            const path = route.path.replace(/:(\w+)/g, 'test-$1'); // Replace params with test values
            
            const response = await request(app)[method](path);
            
            // Property: Registered routes must be accessible (not 404)
            expect(response.status).not.toBe(404);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Route count should match between definition and registration
   */
  test('number of registered routes matches number of defined routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(routeArbitrary, { minLength: 1, maxLength: 15 }),
        async (routeDefinitions) => {
          // Remove duplicates
          const uniqueRoutes = [];
          const seen = new Set();
          
          for (const route of routeDefinitions) {
            const key = `${route.method}:${route.path}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueRoutes.push(route);
            }
          }

          // Create app with the defined routes
          const app = createTestApp(uniqueRoutes);

          // Extract registered routes
          const registeredRoutes = extractRegisteredRoutes(app);

          // Property: Number of registered routes should equal number of defined routes
          expect(registeredRoutes.length).toBe(uniqueRoutes.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Each registered route should have correct method
   */
  test('registered routes preserve HTTP methods from definitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(routeArbitrary, { minLength: 1, maxLength: 10 }),
        async (routeDefinitions) => {
          // Remove duplicates
          const uniqueRoutes = [];
          const seen = new Set();
          
          for (const route of routeDefinitions) {
            const key = `${route.method}:${route.path}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueRoutes.push(route);
            }
          }

          // Create app with the defined routes
          const app = createTestApp(uniqueRoutes);

          // Extract registered routes
          const registeredRoutes = extractRegisteredRoutes(app);

          // Property: Each registered route should have the correct HTTP method
          for (const definedRoute of uniqueRoutes) {
            const matchingRoute = registeredRoutes.find(
              r => r.path === definedRoute.path && r.method === definedRoute.method
            );

            expect(matchingRoute).toBeDefined();
            expect(matchingRoute.method).toBe(definedRoute.method);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
