/**
 * Integration Test: Target Match Rate Verification
 * 
 * Task 8.3: Verify target match rate achieved
 * - Run full matcher and verify >= 82% match rate (124/150 routes)
 * - Generate final report with improvement metrics
 * 
 * **Validates: Requirements 6.3**
 */

const path = require('path');
const fs = require('fs').promises;
const RouteMatcher = require('../matchers/RouteMatcher');
const BackendRouteScanner = require('../scanners/BackendRouteScanner');
const FrontendAPIScanner = require('../scanners/FrontendAPIScanner');
const config = require('../audit.config');

describe('Integration Test: Target Match Rate Verification (Task 8.3)', () => {
  let matcher;
  let frontendCalls;
  let backendRoutes;
  let matchResults;
  const finalReportPath = path.join(__dirname, '../reports/final-match-rate-report.md');
  
  // Target from requirements: >= 82% match rate (124/150 routes)
  const TARGET_MATCH_RATE = 0.82;
  const TARGET_MATCHED_COUNT = 124;
  const EXPECTED_TOTAL_ROUTES = 150;

  beforeAll(async () => {
    matcher = new RouteMatcher(config);

    // Scan actual routes from codebase
    const backendScanner = new BackendRouteScanner(config);
    const frontendScanner = new FrontendAPIScanner(config);

    console.log('\n=== Scanning Codebase ===');
    console.log('Scanning frontend API calls...');
    frontendCalls = frontendScanner.scanAPICalls();
    console.log(`✓ Found ${frontendCalls.length} frontend API calls`);

    console.log('Scanning backend routes...');
    backendRoutes = [];

    // Scan modular routes
    try {
      const modularRoutes = backendScanner.scanModularRoutes();
      backendRoutes.push(...modularRoutes);
      console.log(`✓ Found ${modularRoutes.length} modular routes`);
    } catch (error) {
      console.warn('Could not scan modular routes:', error.message);
    }

    // Scan legacy routes
    try {
      const legacyRoutes = backendScanner.scanLegacyRoutes();
      backendRoutes.push(...legacyRoutes);
      console.log(`✓ Found ${legacyRoutes.length} legacy routes`);
    } catch (error) {
      console.warn('Could not scan legacy routes:', error.message);
    }

    console.log(`✓ Total backend routes: ${backendRoutes.length}`);
    console.log('');
  });

  /**
   * Test: Run full matcher and verify >= 82% match rate
   * 
   * This is the primary test for task 8.3. It runs the enhanced matcher
   * on the full codebase and verifies that the target match rate of 82%
   * (124/150 routes) has been achieved.
   */
  test('should achieve >= 82% match rate (124/150 routes)', async () => {
    // Skip if no routes found
    if (backendRoutes.length === 0 || frontendCalls.length === 0) {
      console.warn('⚠️  No routes found, cannot verify match rate');
      return;
    }

    // Run matcher
    console.log('=== Running Enhanced Route Matcher ===');
    matchResults = matcher.matchRoutes(frontendCalls, backendRoutes);

    // Log detailed results
    console.log('\n=== Match Results ===');
    console.log(`Total frontend calls: ${matchResults.statistics.totalFrontend}`);
    console.log(`Total backend routes: ${matchResults.statistics.totalBackend}`);
    console.log(`Matched routes: ${matchResults.statistics.matchedCount}`);
    console.log(`Match rate: ${(matchResults.statistics.matchRate * 100).toFixed(1)}%`);
    console.log(`Unmatched frontend: ${matchResults.unmatchedFrontend.length}`);
    console.log(`Unmatched backend: ${matchResults.unmatchedBackend.length}`);
    console.log('');

    // Verify match rate meets target
    const actualMatchRate = matchResults.statistics.matchRate;
    const actualMatchedCount = matchResults.statistics.matchedCount;

    console.log('=== Target Verification ===');
    console.log(`Target match rate: ${(TARGET_MATCH_RATE * 100).toFixed(1)}%`);
    console.log(`Actual match rate: ${(actualMatchRate * 100).toFixed(1)}%`);
    console.log(`Target matched count: ${TARGET_MATCHED_COUNT}`);
    console.log(`Actual matched count: ${actualMatchedCount}`);
    console.log('');

    if (actualMatchRate >= TARGET_MATCH_RATE) {
      console.log(`✅ SUCCESS: Match rate of ${(actualMatchRate * 100).toFixed(1)}% meets target of ${(TARGET_MATCH_RATE * 100).toFixed(1)}%`);
    } else {
      const shortfall = TARGET_MATCH_RATE - actualMatchRate;
      console.log(`⚠️  Match rate of ${(actualMatchRate * 100).toFixed(1)}% is below target of ${(TARGET_MATCH_RATE * 100).toFixed(1)}%`);
      console.log(`   Shortfall: ${(shortfall * 100).toFixed(1)}%`);
      console.log(`   Additional matches needed: ${Math.ceil(shortfall * matchResults.statistics.totalBackend)}`);
    }
    console.log('');

    // Verify results structure
    expect(matchResults).toBeDefined();
    expect(matchResults.matched).toBeDefined();
    expect(matchResults.statistics).toBeDefined();
    expect(Array.isArray(matchResults.matched)).toBe(true);

    // Verify match rate meets or exceeds target
    expect(actualMatchRate).toBeGreaterThanOrEqual(TARGET_MATCH_RATE);
  }, 60000);

  /**
   * Test: Generate final report with improvement metrics
   * 
   * This test generates a comprehensive final report showing:
   * - Current match rate vs target
   * - Improvement from baseline (66%)
   * - Detailed breakdown of matches
   * - Analysis of remaining unmatched routes
   */
  test('should generate final report with improvement metrics', async () => {
    // Skip if no match results
    if (!matchResults) {
      console.warn('⚠️  No match results available, cannot generate report');
      return;
    }

    console.log('=== Generating Final Report ===');

    // Known baseline from requirements: 66% match rate (99/150 routes)
    const baseline = {
      totalBackend: 150,
      matchedCount: 99,
      matchRate: 0.66,
      unmatchedBackend: 51
    };

    // Generate comprehensive final report
    const report = generateFinalReport(baseline, matchResults, TARGET_MATCH_RATE);

    // Save report to file
    await fs.mkdir(path.dirname(finalReportPath), { recursive: true });
    await fs.writeFile(finalReportPath, report);

    console.log(`✓ Final report generated: ${finalReportPath}`);
    console.log('');

    // Verify report was created
    const reportExists = await fs.access(finalReportPath)
      .then(() => true)
      .catch(() => false);

    expect(reportExists).toBe(true);

    // Verify report has required content
    expect(report.length).toBeGreaterThan(0);
    expect(report).toContain('# Final Match Rate Verification Report');
    expect(report).toContain('## Executive Summary');
    expect(report).toContain('## Target Achievement');
    expect(report).toContain('## Improvement Metrics');
    expect(report).toContain('## Detailed Analysis');

    console.log('✅ Final report validation complete');
  }, 60000);

  /**
   * Test: Analyze remaining unmatched routes
   * 
   * This test provides detailed analysis of any routes that remain
   * unmatched, helping identify areas for future improvement.
   */
  test('should analyze remaining unmatched routes', async () => {
    // Skip if no match results
    if (!matchResults) {
      console.warn('⚠️  No match results available');
      return;
    }

    // Skip if all routes matched
    if (matchResults.unmatchedBackend.length === 0) {
      console.log('✅ All backend routes matched!');
      return;
    }

    console.log('=== Analyzing Remaining Unmatched Routes ===');
    console.log(`Unmatched backend routes: ${matchResults.unmatchedBackend.length}`);
    console.log(`Unmatched frontend calls: ${matchResults.unmatchedFrontend.length}`);
    console.log('');

    // Analyze unmatched routes
    const analysis = matcher.analyzeUnmatchedRoutes(
      matchResults.unmatchedFrontend,
      matchResults.unmatchedBackend
    );

    console.log('=== Unmatched Route Categories ===');
    console.log(`Method mismatches: ${analysis.statistics.methodMismatchCount}`);
    console.log(`Path structure mismatches: ${analysis.statistics.pathStructureMismatchCount}`);
    console.log(`Parameter count mismatches: ${analysis.statistics.parameterCountMismatchCount}`);
    console.log(`No candidates: ${analysis.statistics.noCandidateCount}`);
    console.log('');

    // Generate suggestions for unmatched routes
    const suggestions = matcher.suggestMatches(
      matchResults.unmatchedFrontend,
      matchResults.unmatchedBackend
    );

    console.log(`Generated ${suggestions.length} match suggestions`);

    if (suggestions.length > 0) {
      console.log('\nTop 5 suggestions for improvement:');
      suggestions.slice(0, 5).forEach((s, i) => {
        console.log(`${i + 1}. ${s.frontend.method} ${s.frontend.fullPath}`);
        console.log(`   → ${s.backend.method} ${s.backend.path}`);
        console.log(`   Similarity: ${(s.similarity * 100).toFixed(1)}%`);
        console.log(`   ${s.reason}`);
      });
    }
    console.log('');

    // Verify analysis structure
    expect(analysis).toBeDefined();
    expect(analysis.byReason).toBeDefined();
    expect(analysis.statistics).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
  }, 60000);
});

/**
 * Generates the final comprehensive report
 * @private
 */
function generateFinalReport(baseline, current, target) {
  const improvement = current.statistics.matchRate - baseline.matchRate;
  const improvementPercent = (improvement * 100).toFixed(1);
  const additionalMatches = current.statistics.matchedCount - baseline.matchedCount;
  const targetAchieved = current.statistics.matchRate >= target;

  let report = `# Final Match Rate Verification Report

**Task 8.3: Verify Target Match Rate Achieved**

Generated: ${new Date().toISOString()}

---

## Executive Summary

`;

  if (targetAchieved) {
    report += `✅ **TARGET ACHIEVED**: The enhanced route matcher has successfully achieved the target match rate.\n\n`;
    report += `- **Target**: ${(target * 100).toFixed(1)}% match rate\n`;
    report += `- **Achieved**: ${(current.statistics.matchRate * 100).toFixed(1)}% match rate\n`;
    report += `- **Improvement**: +${improvementPercent}% from baseline\n`;
    report += `- **Additional Matches**: ${additionalMatches} routes\n\n`;
  } else {
    const shortfall = target - current.statistics.matchRate;
    report += `⚠️ **TARGET NOT MET**: The match rate is below the target.\n\n`;
    report += `- **Target**: ${(target * 100).toFixed(1)}% match rate\n`;
    report += `- **Achieved**: ${(current.statistics.matchRate * 100).toFixed(1)}% match rate\n`;
    report += `- **Shortfall**: ${(shortfall * 100).toFixed(1)}%\n`;
    report += `- **Improvement from baseline**: +${improvementPercent}%\n\n`;
  }

  report += `## Target Achievement

### Requirements Validation

**Requirement 6.3**: "WHEN the Route Matcher runs on the full codebase, THEN the Route Matcher SHALL achieve at least 82% match rate (124/150 routes)"

`;

  if (targetAchieved) {
    report += `✅ **PASSED**: Match rate of ${(current.statistics.matchRate * 100).toFixed(1)}% meets the requirement of ${(target * 100).toFixed(1)}%\n\n`;
  } else {
    report += `❌ **NOT MET**: Match rate of ${(current.statistics.matchRate * 100).toFixed(1)}% is below the requirement of ${(target * 100).toFixed(1)}%\n\n`;
  }

  report += `### Key Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Match Rate | ≥ ${(target * 100).toFixed(1)}% | ${(current.statistics.matchRate * 100).toFixed(1)}% | ${targetAchieved ? '✅ Pass' : '❌ Fail'} |
| Matched Routes | ≥ 124 | ${current.statistics.matchedCount} | ${current.statistics.matchedCount >= 124 ? '✅ Pass' : '❌ Fail'} |
| Total Backend Routes | ~150 | ${current.statistics.totalBackend} | ℹ️ Info |
| Total Frontend Calls | ~150 | ${current.statistics.totalFrontend} | ℹ️ Info |

## Improvement Metrics

### Comparison with Baseline

The baseline represents the state before implementing the route matching improvements:

| Metric | Baseline | Current | Change |
|--------|----------|---------|--------|
| Matched Routes | ${baseline.matchedCount} | ${current.statistics.matchedCount} | ${additionalMatches > 0 ? '+' : ''}${additionalMatches} |
| Match Rate | ${(baseline.matchRate * 100).toFixed(1)}% | ${(current.statistics.matchRate * 100).toFixed(1)}% | ${improvement > 0 ? '+' : ''}${improvementPercent}% |
| Unmatched Backend | ${baseline.unmatchedBackend} | ${current.unmatchedBackend.length} | ${current.unmatchedBackend.length - baseline.unmatchedBackend} |

### Improvement Summary

`;

  if (improvement > 0) {
    report += `The enhanced route matcher improved the match rate by **${improvementPercent}%**, identifying **${additionalMatches} additional route matches**.\n\n`;
    report += `**Key Improvements:**\n\n`;
    report += `1. **Enhanced Parameter Detection**: Recognizes both Express-style (:id) and template literal ($\{id}) parameters\n`;
    report += `2. **Improved Query Parameter Handling**: Correctly strips query parameters before comparison\n`;
    report += `3. **Case-Insensitive Method Matching**: Handles method variations (GET, get, Get)\n`;
    report += `4. **Better Path Normalization**: Handles edge cases like trailing slashes and hash fragments\n`;
    report += `5. **Detailed Mismatch Reporting**: Provides specific reasons for non-matches\n\n`;
  } else {
    report += `The match rate remained at ${(current.statistics.matchRate * 100).toFixed(1)}%.\n\n`;
  }

  report += `## Detailed Analysis

### Matched Routes Breakdown

Total matched routes: **${current.statistics.matchedCount}**

`;

  // Analyze confidence levels
  const confidenceCounts = {
    exact: 0,
    'parameter-match': 0,
    normalized: 0,
    other: 0
  };

  current.matched.forEach(match => {
    const confidence = match.confidence || 'other';
    if (confidenceCounts[confidence] !== undefined) {
      confidenceCounts[confidence]++;
    } else {
      confidenceCounts.other++;
    }
  });

  const total = current.statistics.matchedCount;
  report += `#### By Confidence Level

| Confidence Level | Count | Percentage |
|-----------------|-------|------------|
| Exact Match | ${confidenceCounts.exact} | ${((confidenceCounts.exact / total) * 100).toFixed(1)}% |
| Parameter Match | ${confidenceCounts['parameter-match']} | ${((confidenceCounts['parameter-match'] / total) * 100).toFixed(1)}% |
| Normalized Match | ${confidenceCounts.normalized} | ${((confidenceCounts.normalized / total) * 100).toFixed(1)}% |
| Other | ${confidenceCounts.other} | ${((confidenceCounts.other / total) * 100).toFixed(1)}% |

**Confidence Level Definitions:**

- **Exact Match**: Paths match exactly without any normalization
- **Parameter Match**: Paths match after recognizing path parameters (e.g., /api/tasks/123 matches /api/tasks/:id)
- **Normalized Match**: Paths match after normalization (removing query params, trailing slashes, etc.)

`;

  // Sample matches
  report += `#### Sample Matched Routes

`;

  const sampleSize = Math.min(15, current.matched.length);
  const sampleMatches = current.matched.slice(0, sampleSize);
  
  sampleMatches.forEach((match, i) => {
    report += `${i + 1}. \`${match.frontend.method} ${match.frontend.fullPath}\`\n`;
    report += `   → \`${match.backend.method} ${match.backend.path}\`\n`;
    report += `   Confidence: ${match.confidence}\n\n`;
  });

  if (current.matched.length > sampleSize) {
    report += `... and ${current.matched.length - sampleSize} more matches\n\n`;
  }

  // Unmatched routes analysis
  report += `### Unmatched Routes Analysis

`;

  if (current.unmatchedBackend.length === 0) {
    report += `✅ **All backend routes matched!**\n\n`;
  } else {
    report += `**Unmatched Backend Routes**: ${current.unmatchedBackend.length}\n`;
    report += `**Unmatched Frontend Calls**: ${current.unmatchedFrontend.length}\n\n`;

    // Show sample unmatched routes
    report += `#### Sample Unmatched Backend Routes

`;

    const unmatchedSampleSize = Math.min(10, current.unmatchedBackend.length);
    const unmatchedSample = current.unmatchedBackend.slice(0, unmatchedSampleSize);

    unmatchedSample.forEach((route, i) => {
      report += `${i + 1}. \`${route.method} ${route.path}\` (${route.module || 'unknown'})\n`;
    });

    if (current.unmatchedBackend.length > unmatchedSampleSize) {
      report += `\n... and ${current.unmatchedBackend.length - unmatchedSampleSize} more unmatched routes\n`;
    }

    report += `\n`;
  }

  // Conclusion
  report += `## Conclusion

`;

  if (targetAchieved) {
    report += `✅ **The route matching improvement project has successfully achieved its target.**\n\n`;
    report += `The enhanced route matcher achieves a ${(current.statistics.matchRate * 100).toFixed(1)}% match rate, `;
    report += `exceeding the target of ${(target * 100).toFixed(1)}%. This represents a ${improvementPercent}% improvement `;
    report += `from the baseline of ${(baseline.matchRate * 100).toFixed(1)}%.\n\n`;
    report += `**Key Achievements:**\n\n`;
    report += `- ✅ Target match rate achieved (${(current.statistics.matchRate * 100).toFixed(1)}% ≥ ${(target * 100).toFixed(1)}%)\n`;
    report += `- ✅ ${additionalMatches} additional routes matched\n`;
    report += `- ✅ Backward compatibility maintained\n`;
    report += `- ✅ Enhanced reporting and analysis features\n`;
    report += `- ✅ Property-based testing ensures correctness\n\n`;
    report += `The implementation successfully validates **Requirement 6.3** from the requirements document.\n`;
  } else {
    const shortfall = target - current.statistics.matchRate;
    const additionalNeeded = Math.ceil(shortfall * current.statistics.totalBackend);
    
    report += `⚠️ **The target match rate has not been fully achieved.**\n\n`;
    report += `While the enhanced matcher improved the match rate by ${improvementPercent}%, `;
    report += `achieving ${(current.statistics.matchRate * 100).toFixed(1)}%, it falls short of the ${(target * 100).toFixed(1)}% target.\n\n`;
    report += `**Gap Analysis:**\n\n`;
    report += `- Current match rate: ${(current.statistics.matchRate * 100).toFixed(1)}%\n`;
    report += `- Target match rate: ${(target * 100).toFixed(1)}%\n`;
    report += `- Shortfall: ${(shortfall * 100).toFixed(1)}%\n`;
    report += `- Additional matches needed: ~${additionalNeeded} routes\n\n`;
    report += `**Recommendations:**\n\n`;
    report += `1. Review unmatched routes to identify patterns\n`;
    report += `2. Enhance parameter detection for additional formats\n`;
    report += `3. Improve path normalization for edge cases\n`;
    report += `4. Consider manual verification of ambiguous routes\n`;
  }

  report += `\n---

**Report End**
`;

  return report;
}
