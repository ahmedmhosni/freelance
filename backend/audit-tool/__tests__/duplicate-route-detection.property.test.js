/**
 * Property-Based Test: Duplicate Route Detection
 * 
 * **Feature: full-system-audit, Property 3: Duplicate Route Detection**
 * 
 * For any two routes in the system, if they have the same HTTP method and path,
 * the duplicate detection system should identify and report them as conflicts.
 * 
 * **Validates: Requirements 1.4**
 */

const fc = require('fast-check');
const express = require('express');
const BackendRouteScanner = require('../scanners/BackendRouteScanner');
const config = require('../audit.config');

describe('Property 3: Duplicate Route Detection', () => {
  /**
   * Test that duplicate routes are correctly identified
   */
  test('for any two routes with same method and path, duplicates should be detected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          method: fc.constantFrom('get', 'post', 'put', 'delete', 'patch'),
          path: fc.constantFrom('/test', '/test/:id', '/api/users', '/api/items/:id'),
          numDuplicates: fc.integer({ min: 2, max: 5 })
        }),
        async ({ method, path, numDuplicates }) => {
          // Create Express app with duplicate routes
          const app = express();
          
          // Register the same route multiple times
          for (let i = 0; i < numDuplicates; i++) {
            const handler = (req, res) => {
              res.json({ handler: `handler${i}` });
            };
            app[method](path, handler);
          }

          // Scan routes
          const scanner = new BackendRouteScanner(config);
          const routes = scanner.scanRoutes(app);

          // Detect duplicates
          const duplicates = scanner.detectDuplicates(routes);

          // Should detect at least one duplicate conflict
          // (numDuplicates routes means numDuplicates-1 duplicate conflicts)
          expect(duplicates.length).toBeGreaterThan(0);

          // Verify the duplicate is for the correct method and path
          const duplicate = duplicates.find(d => 
            d.method === method.toUpperCase() && d.path === path
          );
          
          expect(duplicate).toBeDefined();
          expect(duplicate.routes.length).toBeGreaterThanOrEqual(2);
          expect(duplicate.severity).toBe('HIGH');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that unique routes are not flagged as duplicates
   */
  test('for any set of unique routes, no duplicates should be detected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            method: fc.constantFrom('get', 'post', 'put', 'delete', 'patch'),
            path: fc.string({ minLength: 5, maxLength: 20 })
              .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)) // Only alphanumeric, underscore, hyphen
              .map(s => `/${s}`)
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (routeConfigs) => {
          // Create Express app with unique routes
          const app = express();
          
          // Ensure uniqueness by using a Set
          const uniqueRoutes = new Map();
          routeConfigs.forEach(config => {
            const key = `${config.method}:${config.path}`;
            if (!uniqueRoutes.has(key)) {
              uniqueRoutes.set(key, config);
              const handler = (req, res) => res.json({ ok: true });
              try {
                app[config.method](config.path, handler);
              } catch (error) {
                // Skip invalid paths that Express can't handle
              }
            }
          });

          // Scan routes
          const scanner = new BackendRouteScanner(config);
          const routes = scanner.scanRoutes(app);

          // Detect duplicates
          const duplicates = scanner.detectDuplicates(routes);

          // Should not detect any duplicates
          expect(duplicates.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that different methods on same path are not considered duplicates
   */
  test('routes with same path but different methods should not be duplicates', () => {
    const app = express();
    
    // Register same path with different methods
    app.get('/api/users', (req, res) => res.json({ method: 'GET' }));
    app.post('/api/users', (req, res) => res.json({ method: 'POST' }));
    app.put('/api/users/:id', (req, res) => res.json({ method: 'PUT' }));
    app.delete('/api/users/:id', (req, res) => res.json({ method: 'DELETE' }));

    // Scan routes
    const scanner = new BackendRouteScanner(config);
    const routes = scanner.scanRoutes(app);

    // Detect duplicates
    const duplicates = scanner.detectDuplicates(routes);

    // Should not detect any duplicates
    expect(duplicates.length).toBe(0);
  });

  /**
   * Test that duplicate detection provides useful information
   */
  test('duplicate detection should provide conflict details', () => {
    const app = express();
    
    // Register duplicate routes
    app.get('/api/test', (req, res) => res.json({ handler: 1 }));
    app.get('/api/test', (req, res) => res.json({ handler: 2 }));
    app.post('/api/test', (req, res) => res.json({ handler: 3 }));
    app.post('/api/test', (req, res) => res.json({ handler: 4 }));

    // Scan routes
    const scanner = new BackendRouteScanner(config);
    const routes = scanner.scanRoutes(app);

    // Detect duplicates
    const duplicates = scanner.detectDuplicates(routes);

    // Should detect 2 duplicate conflicts (GET and POST)
    expect(duplicates.length).toBe(2);

    // Each duplicate should have required fields
    duplicates.forEach(duplicate => {
      expect(duplicate).toHaveProperty('method');
      expect(duplicate).toHaveProperty('path');
      expect(duplicate).toHaveProperty('routes');
      expect(duplicate).toHaveProperty('severity');
      expect(duplicate).toHaveProperty('message');
      
      expect(duplicate.routes.length).toBeGreaterThanOrEqual(2);
      expect(duplicate.severity).toBe('HIGH');
      expect(duplicate.message).toContain('Duplicate route detected');
    });
  });

  /**
   * Test that case sensitivity is handled correctly
   */
  test('duplicate detection should be case-sensitive for methods', () => {
    const app = express();
    
    // Express normalizes methods to lowercase internally
    // So GET and get are the same
    app.get('/api/test', (req, res) => res.json({ handler: 1 }));
    app.get('/api/test', (req, res) => res.json({ handler: 2 }));

    // Scan routes
    const scanner = new BackendRouteScanner(config);
    const routes = scanner.scanRoutes(app);

    // Detect duplicates
    const duplicates = scanner.detectDuplicates(routes);

    // Should detect duplicate
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].method).toBe('GET');
  });
});
