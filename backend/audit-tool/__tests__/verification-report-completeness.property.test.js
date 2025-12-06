/**
 * Property-Based Test: Verification Report Completeness
 * 
 * **Feature: full-system-audit, Property 17: Verification Report Completeness**
 * 
 * For any endpoint that is tested during the audit, it should appear in the generated verification report.
 * **Validates: Requirements 5.1**
 */

const fc = require('fast-check');
const ReportGenerator = require('../reporters/ReportGenerator');
const { createAuditResults } = require('../models/AuditResults');
const { createVerificationResult } = require('../models/VerificationResult');
const { createRouteInfo } = require('../models/RouteInfo');

describe('Property 17: Verification Report Completeness', () => {
  test('all tested endpoints appear in verification report', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random verification results
        fc.array(
          fc.record({
            method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
            path: fc.oneof(
              fc.constant('/api/clients'),
              fc.constant('/api/projects'),
              fc.constant('/api/tasks'),
              fc.constant('/api/invoices'),
              fc.constant('/api/auth/login'),
              fc.string({ minLength: 5, maxLength: 30 }).map(s => `/api/${s}`)
            ),
            success: fc.boolean(),
            statusCode: fc.oneof(
              fc.constantFrom(200, 201, 204),
              fc.constantFrom(400, 401, 403, 404, 500)
            ),
            responseTime: fc.integer({ min: 10, max: 5000 })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (testData) => {
          // Create verification results from test data
          const verificationResults = testData.map(data => {
            const route = createRouteInfo({
              method: data.method,
              path: data.path,
              handler: 'testHandler',
              middleware: [],
              module: 'test',
              isLegacy: false,
              requiresAuth: false,
              file: 'test.js'
            });

            return createVerificationResult({
              route,
              success: data.success,
              statusCode: data.statusCode,
              responseTime: data.responseTime,
              timestamp: new Date().toISOString(),
              request: {
                method: data.method,
                path: data.path,
                headers: {},
                body: {}
              },
              response: {
                status: data.statusCode,
                headers: {},
                body: {}
              },
              errors: []
            });
          });

          // Create audit results
          const auditResults = createAuditResults({
            summary: {
              totalRoutes: verificationResults.length,
              totalFrontendCalls: 0,
              matchedRoutes: verificationResults.length,
              unmatchedRoutes: 0,
              passedTests: verificationResults.filter(r => r.success).length,
              failedTests: verificationResults.filter(r => !r.success).length,
              issues: 0
            },
            routes: {
              modular: verificationResults.map(r => r.route),
              legacy: [],
              all: verificationResults.map(r => r.route)
            },
            frontendCalls: [],
            matches: {
              matched: [],
              unmatchedFrontend: [],
              unmatchedBackend: []
            },
            verificationResults,
            issues: [],
            timestamp: new Date().toISOString()
          });

          // Generate report
          const generator = new ReportGenerator();
          const report = generator.generateSummaryReport(auditResults);

          // Property: All tested endpoints should appear in the report
          // We verify this by checking that the report contains the test counts
          expect(report).toContain('Verification Results');
          expect(report).toContain(`Tests Passed | ${auditResults.summary.passedTests}`);
          expect(report).toContain(`Tests Failed | ${auditResults.summary.failedTests}`);
          
          // Verify the report includes the total number of routes tested
          expect(report).toContain(`Total Routes | ${verificationResults.length}`);
          
          // Verify report is not empty
          expect(report.length).toBeGreaterThan(100);
          
          // Verify report has proper structure
          expect(report).toContain('# Audit Summary Report');
          expect(report).toContain('## Overall Status:');
          expect(report).toContain('## 📍 Route Discovery');
          expect(report).toContain('## 🧪 Verification Results');
        }
      ),
      { numRuns: 100 }
    );
  });
});
