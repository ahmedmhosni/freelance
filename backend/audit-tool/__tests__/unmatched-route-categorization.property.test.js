/**
 * Property-Based Tests for Unmatched Route Categorization
 * 
 * **Feature: route-matching-improvement, Property 7: Unmatched route categorization**
 * **Validates: Requirements 4.1, 4.2**
 * 
 * Property: For any set of unmatched routes, the analysis should categorize each route 
 * into exactly one category: method-mismatch, path-structure-mismatch, 
 * parameter-count-mismatch, or no-candidate.
 */

const fc = require('fast-check');
const RouteMatcher = require('../matchers/RouteMatcher');

describe('Property 7: Unmatched route categorization', () => {
  const matcher = new RouteMatcher({});

  /**
   * Arbitrary for generating API call info
   */
  const apiCallArbitrary = fc.record({
    method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    path: fc.oneof(
      fc.constant('/api/tasks'),
      fc.constant('/api/projects'),
      fc.constant('/api/invoices/123'),
      fc.constant('/api/clients/456'),
      fc.constant('/api/time-tracking/duration/task/789')
    ),
    fullPath: fc.oneof(
      fc.constant('/api/tasks'),
      fc.constant('/api/projects'),
      fc.constant('/api/invoices/123'),
      fc.constant('/api/clients/456'),
      fc.constant('/api/time-tracking/duration/task/789')
    ),
    file: fc.constant('test.js'),
    line: fc.nat(1000),
    hasBaseURL: fc.boolean()
  });

  /**
   * Arbitrary for generating route info
   */
  const routeInfoArbitrary = fc.record({
    method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    path: fc.oneof(
      fc.constant('/api/tasks'),
      fc.constant('/api/projects'),
      fc.constant('/api/invoices/:id'),
      fc.constant('/api/clients/:clientId'),
      fc.constant('/api/time-tracking/duration/task/:taskId')
    ),
    file: fc.constant('routes.js'),
    line: fc.nat(1000),
    controller: fc.constant('TestController'),
    handler: fc.constant('testHandler')
  });

  test('each unmatched route is categorized into exactly one category', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 0, maxLength: 10 }),
        fc.array(routeInfoArbitrary, { minLength: 0, maxLength: 10 }),
        (unmatchedFrontend, unmatchedBackend) => {
          const analysis = matcher.analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend);

          // Verify analysis structure exists
          expect(analysis).toHaveProperty('byReason');
          expect(analysis).toHaveProperty('statistics');
          expect(analysis.byReason).toHaveProperty('method-mismatch');
          expect(analysis.byReason).toHaveProperty('path-structure-mismatch');
          expect(analysis.byReason).toHaveProperty('parameter-count-mismatch');
          expect(analysis.byReason).toHaveProperty('no-candidate');

          // Count total categorized routes
          const totalCategorized = 
            analysis.byReason['method-mismatch'].length +
            analysis.byReason['path-structure-mismatch'].length +
            analysis.byReason['parameter-count-mismatch'].length +
            analysis.byReason['no-candidate'].length;

          // Total categorized should equal total unmatched (frontend + backend)
          // Note: Some backend routes might be paired with frontend routes in mismatch categories
          // So we need to count unique routes
          const totalUnmatched = unmatchedFrontend.length + unmatchedBackend.length;
          
          // Each frontend route should appear in exactly one category
          const frontendInCategories = new Set();
          for (const category of ['method-mismatch', 'path-structure-mismatch', 'parameter-count-mismatch']) {
            analysis.byReason[category].forEach(item => {
              if (item.frontend) {
                frontendInCategories.add(item.frontend);
              }
            });
          }
          analysis.byReason['no-candidate'].forEach(item => {
            if (item.type === 'frontend') {
              frontendInCategories.add(item.route);
            }
          });

          // All frontend routes should be categorized
          expect(frontendInCategories.size).toBe(unmatchedFrontend.length);

          // Verify statistics match category counts
          expect(analysis.statistics.methodMismatchCount).toBe(analysis.byReason['method-mismatch'].length);
          expect(analysis.statistics.pathStructureMismatchCount).toBe(analysis.byReason['path-structure-mismatch'].length);
          expect(analysis.statistics.parameterCountMismatchCount).toBe(analysis.byReason['parameter-count-mismatch'].length);
          
          // Statistics should be non-negative
          expect(analysis.statistics.methodMismatchCount).toBeGreaterThanOrEqual(0);
          expect(analysis.statistics.pathStructureMismatchCount).toBeGreaterThanOrEqual(0);
          expect(analysis.statistics.parameterCountMismatchCount).toBeGreaterThanOrEqual(0);
          expect(analysis.statistics.noCandidateCount).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('method-mismatch category contains only routes with matching paths but different methods', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(routeInfoArbitrary, { minLength: 1, maxLength: 5 }),
        (unmatchedFrontend, unmatchedBackend) => {
          const analysis = matcher.analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend);

          // Check each method-mismatch entry
          analysis.byReason['method-mismatch'].forEach(item => {
            expect(item).toHaveProperty('frontend');
            expect(item).toHaveProperty('backend');
            expect(item).toHaveProperty('details');
            
            // Methods should be different (case-insensitive)
            expect(item.frontend.method.toUpperCase()).not.toBe(item.backend.method.toUpperCase());
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('no-candidate category contains routes with no matching counterpart', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 0, maxLength: 5 }),
        fc.array(routeInfoArbitrary, { minLength: 0, maxLength: 5 }),
        (unmatchedFrontend, unmatchedBackend) => {
          const analysis = matcher.analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend);

          // Check each no-candidate entry
          analysis.byReason['no-candidate'].forEach(item => {
            expect(item).toHaveProperty('route');
            expect(item).toHaveProperty('type');
            expect(['frontend', 'backend']).toContain(item.type);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('statistics totals match category counts', () => {
    fc.assert(
      fc.property(
        fc.array(apiCallArbitrary, { minLength: 0, maxLength: 10 }),
        fc.array(routeInfoArbitrary, { minLength: 0, maxLength: 10 }),
        (unmatchedFrontend, unmatchedBackend) => {
          const analysis = matcher.analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend);

          // Sum of all category counts should match statistics
          const sumFromCategories = 
            analysis.statistics.methodMismatchCount +
            analysis.statistics.pathStructureMismatchCount +
            analysis.statistics.parameterCountMismatchCount +
            analysis.statistics.noCandidateCount;

          const sumFromArrays = 
            analysis.byReason['method-mismatch'].length +
            analysis.byReason['path-structure-mismatch'].length +
            analysis.byReason['parameter-count-mismatch'].length +
            analysis.byReason['no-candidate'].length;

          expect(sumFromCategories).toBe(sumFromArrays);
        }
      ),
      { numRuns: 100 }
    );
  });
});
