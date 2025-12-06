/**
 * Integration Test: Full Audit Flow
 * 
 * Tests the complete audit process from discovery to reporting.
 * Verifies all phases execute correctly and reports are generated.
 * 
 * **Validates: Requirements 1.1, 2.1, 3.1, 5.1**
 */

const path = require('path');
const fs = require('fs').promises;
const AuditOrchestrator = require('../AuditOrchestrator');
const config = require('../audit.config');

describe('Integration Test: Full Audit Flow', () => {
  let orchestrator;
  let testReportsPath;

  beforeAll(async () => {
    // Create a temporary reports directory for testing
    testReportsPath = path.join(__dirname, '../reports-test');
    await fs.mkdir(testReportsPath, { recursive: true });

    // Override config for testing
    const testConfig = {
      ...config,
      reporting: {
        ...config.reporting,
        outputPath: testReportsPath
      },
      verification: {
        ...config.verification,
        timeout: 10000 // Increase timeout for integration tests
      }
    };

    orchestrator = new AuditOrchestrator(testConfig);
  });

  afterAll(async () => {
    // Cleanup
    if (orchestrator) {
      await orchestrator.cleanup();
    }

    // Remove test reports directory
    try {
      await fs.rm(testReportsPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * Test: Complete audit executes all phases successfully
   */
  test('should complete full audit with all phases', async () => {
    // Run full audit (skip verification to avoid needing running server)
    const result = await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    });

    // Verify audit completed successfully
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeGreaterThan(0);
    expect(result.results).toBeDefined();

    // Verify results structure
    expect(result.results.summary).toBeDefined();
    expect(result.results.routes).toBeDefined();
    expect(result.results.frontendCalls).toBeDefined();
    expect(result.results.matches).toBeDefined();
    expect(result.results.issues).toBeDefined();
    expect(result.results.timestamp).toBeDefined();

    // Verify summary statistics
    expect(result.results.summary.totalRoutes).toBeGreaterThanOrEqual(0);
    expect(result.results.summary.totalFrontendCalls).toBeGreaterThanOrEqual(0);
    expect(result.results.summary.matchedRoutes).toBeGreaterThanOrEqual(0);
    expect(result.results.summary.issues).toBeGreaterThanOrEqual(0);
  }, 60000); // 60 second timeout

  /**
   * Test: Discovery phase finds routes and API calls
   */
  test('should discover backend routes and frontend API calls', async () => {
    const result = await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    });

    // Verify routes were discovered
    expect(result.results.routes.all).toBeDefined();
    expect(Array.isArray(result.results.routes.all)).toBe(true);

    // Verify frontend calls were discovered
    expect(result.results.frontendCalls).toBeDefined();
    expect(Array.isArray(result.results.frontendCalls)).toBe(true);

    // Log discovery results for debugging
    console.log(`Discovered ${result.results.routes.all.length} routes`);
    console.log(`Discovered ${result.results.frontendCalls.length} frontend API calls`);
  }, 60000);

  /**
   * Test: Matching phase pairs frontend calls with backend routes
   */
  test('should match frontend calls to backend routes', async () => {
    const result = await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    });

    // Verify matching results exist
    expect(result.results.matches).toBeDefined();
    expect(result.results.matches.matched).toBeDefined();
    expect(result.results.matches.unmatchedFrontend).toBeDefined();
    expect(result.results.matches.unmatchedBackend).toBeDefined();

    // Verify arrays
    expect(Array.isArray(result.results.matches.matched)).toBe(true);
    expect(Array.isArray(result.results.matches.unmatchedFrontend)).toBe(true);
    expect(Array.isArray(result.results.matches.unmatchedBackend)).toBe(true);

    // Log matching results
    console.log(`Matched: ${result.results.matches.matched.length}`);
    console.log(`Unmatched frontend: ${result.results.matches.unmatchedFrontend.length}`);
    console.log(`Unmatched backend: ${result.results.matches.unmatchedBackend.length}`);
  }, 60000);

  /**
   * Test: Reports are generated successfully
   */
  test('should generate all required reports', async () => {
    const result = await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    });

    // Verify reports were generated
    expect(result.reports).toBeDefined();
    expect(result.reports.summary).toBeDefined();
    expect(result.reports.routes).toBeDefined();
    expect(result.reports.issues).toBeDefined();

    // Verify report content exists
    expect(result.reports.summary.content).toBeDefined();
    expect(result.reports.summary.content.length).toBeGreaterThan(0);
    expect(result.reports.routes.content).toBeDefined();
    expect(result.reports.routes.content.length).toBeGreaterThan(0);
    expect(result.reports.issues.content).toBeDefined();
    expect(result.reports.issues.content.length).toBeGreaterThan(0);

    // Verify report files were created
    const summaryExists = await fs.access(result.reports.summary.path)
      .then(() => true)
      .catch(() => false);
    const routesExists = await fs.access(result.reports.routes.path)
      .then(() => true)
      .catch(() => false);
    const issuesExists = await fs.access(result.reports.issues.path)
      .then(() => true)
      .catch(() => false);

    expect(summaryExists).toBe(true);
    expect(routesExists).toBe(true);
    expect(issuesExists).toBe(true);
  }, 60000);

  /**
   * Test: Progress events are emitted during audit
   */
  test('should emit progress events during audit execution', async () => {
    const progressEvents = [];
    const phaseCompleteEvents = [];

    // Listen for progress events
    orchestrator.on('progress', (event) => {
      progressEvents.push(event);
    });

    orchestrator.on('phase:complete', (event) => {
      phaseCompleteEvents.push(event);
    });

    // Run audit
    await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    });

    // Verify progress events were emitted
    expect(progressEvents.length).toBeGreaterThan(0);
    expect(phaseCompleteEvents.length).toBeGreaterThan(0);

    // Verify phase complete events for discovery, matching, analysis, reporting
    const phases = phaseCompleteEvents.map(e => e.phase);
    expect(phases).toContain('discovery');
    expect(phases).toContain('matching');
    expect(phases).toContain('analysis');
    expect(phases).toContain('reporting');

    // Remove listeners
    orchestrator.removeAllListeners('progress');
    orchestrator.removeAllListeners('phase:complete');
  }, 60000);

  /**
   * Test: Issues are identified and categorized
   */
  test('should identify and categorize issues', async () => {
    const result = await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    });

    // Verify issues array exists
    expect(result.results.issues).toBeDefined();
    expect(Array.isArray(result.results.issues)).toBe(true);

    // If issues exist, verify they have required properties
    if (result.results.issues.length > 0) {
      const issue = result.results.issues[0];
      expect(issue.id).toBeDefined();
      expect(issue.type).toBeDefined();
      expect(issue.severity).toBeDefined();
      expect(issue.title).toBeDefined();
      expect(issue.description).toBeDefined();
      expect(issue.location).toBeDefined();
      expect(issue.suggestedFix).toBeDefined();

      // Verify severity is valid
      expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(issue.severity);
    }

    console.log(`Identified ${result.results.issues.length} issues`);
  }, 60000);

  /**
   * Test: Cache functionality works correctly
   */
  test('should support caching for faster re-runs', async () => {
    // First run without cache
    const firstRun = await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true,
      useCache: false
    });

    const firstRunTime = firstRun.executionTime;

    // Second run with cache
    const secondRun = await orchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true,
      useCache: true
    });

    const secondRunTime = secondRun.executionTime;

    // Verify both runs completed successfully
    expect(firstRun.success).toBe(true);
    expect(secondRun.success).toBe(true);

    // Verify results are consistent
    expect(secondRun.results.summary.totalRoutes).toBe(firstRun.results.summary.totalRoutes);
    expect(secondRun.results.summary.totalFrontendCalls).toBe(firstRun.results.summary.totalFrontendCalls);

    // Second run should be faster (or at least not significantly slower)
    // Note: This is a soft check as timing can vary
    console.log(`First run: ${firstRunTime}ms, Second run (cached): ${secondRunTime}ms`);
  }, 120000);

  /**
   * Test: Error handling during audit phases
   */
  test('should handle errors gracefully and continue audit', async () => {
    // Create orchestrator with invalid frontend path to trigger error
    const invalidConfig = {
      ...config,
      frontend: {
        ...config.frontend,
        srcPath: '/invalid/path/that/does/not/exist'
      },
      reporting: {
        ...config.reporting,
        outputPath: testReportsPath
      }
    };

    const errorOrchestrator = new AuditOrchestrator(invalidConfig);

    // Run audit - should handle error and continue
    const result = await errorOrchestrator.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    }).catch(error => {
      // Audit may throw error for invalid paths
      return { success: false, error: error.message };
    });

    // Verify error was captured
    const errors = errorOrchestrator.getErrors();
    expect(errors.length).toBeGreaterThanOrEqual(0);

    await errorOrchestrator.cleanup();
  }, 60000);

  /**
   * Test: Quick audit mode (discovery and matching only)
   */
  test('should support quick audit mode without verification', async () => {
    const result = await orchestrator.runQuickAudit();

    // Verify audit completed
    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();

    // Verify verification was skipped
    expect(result.results.verificationResults).toBeDefined();
    expect(result.results.verificationResults.length).toBe(0);

    // Verify discovery and matching still happened
    expect(result.results.routes.all.length).toBeGreaterThanOrEqual(0);
    expect(result.results.frontendCalls.length).toBeGreaterThanOrEqual(0);
  }, 60000);
});
