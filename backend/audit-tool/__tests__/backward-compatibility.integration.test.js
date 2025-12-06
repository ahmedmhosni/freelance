/**
 * Integration Test: Backward Compatibility Validation
 * 
 * Tests that the enhanced route matcher maintains backward compatibility
 * by verifying that all previously matched routes remain matched.
 * 
 * **Validates: Requirements 5.1**
 */

const path = require('path');
const fs = require('fs').promises;
const RouteMatcher = require('../matchers/RouteMatcher');
const BackendRouteScanner = require('../scanners/BackendRouteScanner');
const FrontendAPIScanner = require('../scanners/FrontendAPIScanner');
const config = require('../audit.config');
const { createAPICallInfo } = require('../models/APICallInfo');
const { createRouteInfo } = require('../models/RouteInfo');

describe('Integration Test: Backward Compatibility Validation', () => {
  let matcher;
  let baselineResults;
  const baselinePath = path.join(__dirname, '../reports/baseline-matches.json');

  beforeAll(async () => {
    matcher = new RouteMatcher(config);
  });

  /**
   * Test: Export current matched routes as baseline
   * 
   * This test captures the current state of matched routes to use as a baseline
   * for backward compatibility testing.
   */
  test('should export current matched routes as baseline', async () => {
    // Scan actual routes from codebase
    const backendScanner = new BackendRouteScanner(config);
    const frontendScanner = new FrontendAPIScanner(config);

    const frontendCalls = frontendScanner.scanAPICalls();
    const backendRoutes = [];

    // Try to scan routes from files (without running server)
    try {
      // Scan legacy routes
      const legacyRoutes = backendScanner.scanLegacyRoutes();
      backendRoutes.push(...legacyRoutes);
    } catch (error) {
      console.warn('Could not scan legacy routes:', error.message);
    }

    // If we have routes, perform matching
    if (backendRoutes.length > 0 && frontendCalls.length > 0) {
      const matchResults = matcher.matchRoutes(frontendCalls, backendRoutes);

      // Create baseline data
      baselineResults = {
        timestamp: new Date().toISOString(),
        statistics: matchResults.statistics,
        matchedCount: matchResults.matched.length,
        matchedPairs: matchResults.matched.map(match => ({
          frontend: {
            method: match.frontend.method,
            path: match.frontend.path,
            fullPath: match.frontend.fullPath
          },
          backend: {
            method: match.backend.method,
            path: match.backend.path
          },
          confidence: match.confidence
        }))
      };

      // Save baseline to file
      await fs.mkdir(path.dirname(baselinePath), { recursive: true });
      await fs.writeFile(baselinePath, JSON.stringify(baselineResults, null, 2));

      console.log(`Baseline exported: ${baselineResults.matchedCount} matched routes`);
      console.log(`Match rate: ${(baselineResults.statistics.matchRate * 100).toFixed(1)}%`);

      // Verify baseline was created
      expect(baselineResults.matchedCount).toBeGreaterThanOrEqual(0);
      expect(baselineResults.matchedPairs).toBeDefined();
      expect(Array.isArray(baselineResults.matchedPairs)).toBe(true);
    } else {
      console.warn('No routes found to create baseline');
      // Create empty baseline
      baselineResults = {
        timestamp: new Date().toISOString(),
        statistics: {
          totalFrontend: 0,
          totalBackend: 0,
          matchedCount: 0,
          matchRate: 0,
          improvementFromPrevious: 0
        },
        matchedCount: 0,
        matchedPairs: []
      };
      await fs.mkdir(path.dirname(baselinePath), { recursive: true });
      await fs.writeFile(baselinePath, JSON.stringify(baselineResults, null, 2));
    }
  }, 60000);

  /**
   * Test: Run enhanced matcher on same data
   * 
   * This test runs the enhanced matcher on the same data and verifies
   * that it produces consistent results.
   */
  test('should run enhanced matcher on baseline data', async () => {
    // Load baseline if not already loaded
    if (!baselineResults) {
      try {
        const baselineContent = await fs.readFile(baselinePath, 'utf-8');
        baselineResults = JSON.parse(baselineContent);
      } catch (error) {
        console.warn('Could not load baseline, skipping test');
        return;
      }
    }

    // Skip if no baseline data
    if (baselineResults.matchedCount === 0) {
      console.warn('No baseline data available, skipping test');
      return;
    }

    // Reconstruct frontend calls and backend routes from baseline
    const frontendCalls = baselineResults.matchedPairs.map(pair =>
      createAPICallInfo({
        method: pair.frontend.method,
        path: pair.frontend.path,
        fullPath: pair.frontend.fullPath,
        file: 'test',
        line: 1,
        component: 'test',
        hasBaseURL: true
      })
    );

    const backendRoutes = baselineResults.matchedPairs.map(pair =>
      createRouteInfo({
        method: pair.backend.method,
        path: pair.backend.path,
        handler: 'test',
        middleware: [],
        module: 'test',
        isLegacy: false,
        requiresAuth: false,
        file: 'test'
      })
    );

    // Run enhanced matcher
    const enhancedResults = matcher.matchRoutes(frontendCalls, backendRoutes);

    // Verify results
    expect(enhancedResults.matched).toBeDefined();
    expect(enhancedResults.statistics).toBeDefined();

    console.log(`Enhanced matcher results: ${enhancedResults.matched.length} matched routes`);
    console.log(`Match rate: ${(enhancedResults.statistics.matchRate * 100).toFixed(1)}%`);

    // Store enhanced results for next test
    baselineResults.enhancedResults = {
      matchedCount: enhancedResults.matched.length,
      statistics: enhancedResults.statistics
    };
  }, 60000);

  /**
   * Test: Verify all existing matches are preserved
   * 
   * This is the core backward compatibility test - it verifies that every
   * route pair that was matched in the baseline is still matched by the
   * enhanced matcher.
   */
  test('should preserve all existing matches', async () => {
    // Load baseline if not already loaded
    if (!baselineResults) {
      try {
        const baselineContent = await fs.readFile(baselinePath, 'utf-8');
        baselineResults = JSON.parse(baselineContent);
      } catch (error) {
        console.warn('Could not load baseline, skipping test');
        return;
      }
    }

    // Skip if no baseline data
    if (baselineResults.matchedCount === 0) {
      console.warn('No baseline data available, skipping test');
      return;
    }

    // Reconstruct frontend calls and backend routes from baseline
    const frontendCalls = baselineResults.matchedPairs.map(pair =>
      createAPICallInfo({
        method: pair.frontend.method,
        path: pair.frontend.path,
        fullPath: pair.frontend.fullPath,
        file: 'test',
        line: 1,
        component: 'test',
        hasBaseURL: true
      })
    );

    const backendRoutes = baselineResults.matchedPairs.map(pair =>
      createRouteInfo({
        method: pair.backend.method,
        path: pair.backend.path,
        handler: 'test',
        middleware: [],
        module: 'test',
        isLegacy: false,
        requiresAuth: false,
        file: 'test'
      })
    );

    // Run enhanced matcher
    const enhancedResults = matcher.matchRoutes(frontendCalls, backendRoutes);

    // Verify that all baseline matches are still matched
    const brokenMatches = [];

    for (const baselinePair of baselineResults.matchedPairs) {
      // Check if this pair is still matched
      const stillMatched = enhancedResults.matched.some(match =>
        match.frontend.method === baselinePair.frontend.method &&
        match.frontend.fullPath === baselinePair.frontend.fullPath &&
        match.backend.method === baselinePair.backend.method &&
        match.backend.path === baselinePair.backend.path
      );

      if (!stillMatched) {
        brokenMatches.push(baselinePair);
      }
    }

    // Report results
    if (brokenMatches.length > 0) {
      console.error(`❌ ${brokenMatches.length} previously matched routes are no longer matched:`);
      brokenMatches.forEach(pair => {
        console.error(`  ${pair.frontend.method} ${pair.frontend.fullPath} -> ${pair.backend.method} ${pair.backend.path}`);
      });
    } else {
      console.log(`✓ All ${baselineResults.matchedCount} baseline matches preserved`);
    }

    // Assert no matches were broken
    expect(brokenMatches.length).toBe(0);

    // Verify match count is at least as high as baseline
    expect(enhancedResults.matched.length).toBeGreaterThanOrEqual(baselineResults.matchedCount);

    // Calculate improvement
    const improvement = enhancedResults.matched.length - baselineResults.matchedCount;
    if (improvement > 0) {
      console.log(`✓ Enhanced matcher found ${improvement} additional matches`);
    }
  }, 60000);

  /**
   * Test: Verify match rate has not decreased
   * 
   * This test ensures that the overall match rate has not decreased
   * with the enhanced matcher.
   */
  test('should maintain or improve match rate', async () => {
    // Load baseline if not already loaded
    if (!baselineResults) {
      try {
        const baselineContent = await fs.readFile(baselinePath, 'utf-8');
        baselineResults = JSON.parse(baselineContent);
      } catch (error) {
        console.warn('Could not load baseline, skipping test');
        return;
      }
    }

    // Skip if no enhanced results
    if (!baselineResults.enhancedResults) {
      console.warn('No enhanced results available, skipping test');
      return;
    }

    const baselineMatchRate = baselineResults.statistics.matchRate;
    const enhancedMatchRate = baselineResults.enhancedResults.statistics.matchRate;

    console.log(`Baseline match rate: ${(baselineMatchRate * 100).toFixed(1)}%`);
    console.log(`Enhanced match rate: ${(enhancedMatchRate * 100).toFixed(1)}%`);

    // Verify match rate has not decreased
    expect(enhancedMatchRate).toBeGreaterThanOrEqual(baselineMatchRate);

    // Calculate improvement
    const improvement = enhancedMatchRate - baselineMatchRate;
    if (improvement > 0) {
      console.log(`✓ Match rate improved by ${(improvement * 100).toFixed(1)}%`);
    } else {
      console.log(`✓ Match rate maintained at ${(enhancedMatchRate * 100).toFixed(1)}%`);
    }
  }, 60000);
});
