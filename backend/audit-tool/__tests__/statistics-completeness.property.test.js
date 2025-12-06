/**
 * Property-Based Tests for Statistics Completeness
 * 
 * **Feature: route-matching-improvement, Property 9: Statistics completeness**
 * **Validates: Requirements 4.4**
 * 
 * Property: For any match result, the statistics object should contain all required fields:
 * totalFrontend, totalBackend, matchedCount, matchRate, and improvementFromPrevious.
 */

const fc = require('fast-check');
const RouteMatcher = require('../matchers/RouteMatcher');

describe('Property 9: Statistics completeness', () => {
  const matcher = new RouteMatcher({});

  /**
   * Arbitrary for generating API call info
   */
  const apiCallArbitrary = fc.record({
    method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
    path: fc.oneof(
      fc.constant('/api/tasks'),
      fc.constant('/api/projects'),
      fc.constant('/api/invoices/123')
    ),
    fullPath: fc.oneof(
      fc.constant('/api/tasks'),
      fc.constant('/api/projects'),
      fc.constant('/api/invoices/123')
    ),
    file: fc.constant('test.js'),
    line: fc.nat(1000),
    hasBaseURL: fc.boolean()
  });

  /**
   * Arbitrary for generating route info
   */
  const routeInfoArbitrary = fc.record({
    method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
    path: fc.oneof(
      fc.constant('/api/tasks'),
      fc.constant('/api/projects'),
      fc.constant('/api/invoices/:id')
    ),
    file: fc.constant('routes.js'),
    line: fc.nat(1000),
    controller: fc.constant('TestController'),
    handler: fc.constant('testHandler')
  });

  test('statistics object contains all required fields', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 0, maxLength: 10 }),
        fc.array(routeInfoArbitrary, { minLength: 0, maxLength: 10 }),
        (frontendCalls, backendRoutes) => {
          const result = matcher.matchRoutes(frontendCalls, backendRoutes);

          // Verify statistics object exists
          expect(result).toHaveProperty('statistics');
          expect(result.statistics).toBeDefined();

          // Verify all required fields exist
          expect(result.statistics).toHaveProperty('totalFrontend');
          expect(result.statistics).toHaveProperty('totalBackend');
          expect(result.statistics).toHaveProperty('matchedCount');
          expect(result.statistics).toHaveProperty('matchRate');
          expect(result.statistics).toHaveProperty('improvementFromPrevious');

          // Verify field types
          expect(typeof result.statistics.totalFrontend).toBe('number');
          expect(typeof result.statistics.totalBackend).toBe('number');
          expect(typeof result.statistics.matchedCount).toBe('number');
          expect(typeof result.statistics.matchRate).toBe('number');
          expect(typeof result.statistics.improvementFromPrevious).toBe('number');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('statistics values are accurate', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 0, maxLength: 10 }),
        fc.array(routeInfoArbitrary, { minLength: 0, maxLength: 10 }),
        (frontendCalls, backendRoutes) => {
          const result = matcher.matchRoutes(frontendCalls, backendRoutes);

          // Total counts should match input arrays
          expect(result.statistics.totalFrontend).toBe(frontendCalls.length);
          expect(result.statistics.totalBackend).toBe(backendRoutes.length);

          // Matched count should match matched array length
          expect(result.statistics.matchedCount).toBe(result.matched.length);

          // Match rate should be between 0 and 1
          expect(result.statistics.matchRate).toBeGreaterThanOrEqual(0);
          expect(result.statistics.matchRate).toBeLessThanOrEqual(1);

          // If there are backend routes, match rate should be calculated correctly
          if (backendRoutes.length > 0) {
            const expectedMatchRate = result.matched.length / backendRoutes.length;
            expect(result.statistics.matchRate).toBeCloseTo(expectedMatchRate, 5);
          } else {
            // If no backend routes, match rate should be 0
            expect(result.statistics.matchRate).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('improvement from previous is calculated correctly', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(routeInfoArbitrary, { minLength: 1, maxLength: 5 }),
        (frontendCalls, backendRoutes) => {
          // First run
          const firstResult = matcher.matchRoutes(frontendCalls, backendRoutes);
          
          // Second run with previous results
          const secondResult = matcher.matchRoutes(frontendCalls, backendRoutes, firstResult);

          // Improvement should be calculated
          const expectedImprovement = secondResult.statistics.matchRate - firstResult.statistics.matchRate;
          expect(secondResult.statistics.improvementFromPrevious).toBeCloseTo(expectedImprovement, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('matched routes have confidence levels', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 1, maxLength: 10 }),
        fc.array(routeInfoArbitrary, { minLength: 1, maxLength: 10 }),
        (frontendCalls, backendRoutes) => {
          const result = matcher.matchRoutes(frontendCalls, backendRoutes);

          // Each matched route should have a confidence level
          result.matched.forEach(match => {
            expect(match).toHaveProperty('confidence');
            expect(typeof match.confidence).toBe('string');
            expect(['exact', 'parameter-match', 'normalized']).toContain(match.confidence);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('statistics are non-negative', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 0, maxLength: 10 }),
        fc.array(routeInfoArbitrary, { minLength: 0, maxLength: 10 }),
        (frontendCalls, backendRoutes) => {
          const result = matcher.matchRoutes(frontendCalls, backendRoutes);

          // All counts should be non-negative
          expect(result.statistics.totalFrontend).toBeGreaterThanOrEqual(0);
          expect(result.statistics.totalBackend).toBeGreaterThanOrEqual(0);
          expect(result.statistics.matchedCount).toBeGreaterThanOrEqual(0);
          expect(result.statistics.matchRate).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
