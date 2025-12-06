/**
 * Property-Based Test: Issue Resolution Tracking
 * 
 * **Feature: full-system-audit, Property 19: Issue Resolution Tracking**
 * 
 * For any issue that is fixed, the issue tracking system should mark it as resolved 
 * and record the fix timestamp.
 * **Validates: Requirements 5.5**
 */

const fc = require('fast-check');
const ReportGenerator = require('../reporters/ReportGenerator');
const { createIssue } = require('../models/Issue');

describe('Property 19: Issue Resolution Tracking', () => {
  test('marking issue as resolved records fix timestamp and updates status', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random issues
        fc.record({
          type: fc.constantFrom('ROUTE_MISMATCH', 'DUPLICATE_PREFIX', 'AUTH_FAILURE', 'DATABASE_ERROR', 'VALIDATION_ERROR', 'MISSING_ROUTE'),
          severity: fc.constantFrom('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
          title: fc.string({ minLength: 10, maxLength: 100 }),
          description: fc.string({ minLength: 20, maxLength: 500 }),
          file: fc.string({ minLength: 5, maxLength: 50 }).map(s => `src/${s}.js`),
          line: fc.integer({ min: 1, max: 1000 }),
          suggestedFix: fc.string({ minLength: 10, maxLength: 200 })
        }),
        // Generate random fix information
        fc.record({
          description: fc.string({ minLength: 10, maxLength: 200 }),
          commit: fc.option(fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'), { minLength: 7, maxLength: 40 }).map(arr => arr.join(''))),
          author: fc.option(fc.string({ minLength: 3, maxLength: 50 }))
        }),
        async (issueData, fixInfo) => {
          // Create an issue
          const issue = createIssue({
            type: issueData.type,
            severity: issueData.severity,
            title: issueData.title,
            description: issueData.description,
            location: {
              file: issueData.file,
              line: issueData.line
            },
            suggestedFix: issueData.suggestedFix,
            relatedRoutes: []
          });

          // Verify issue starts as OPEN
          expect(issue.status).toBe('OPEN');
          expect(issue.fix).toBeNull();

          // Mark issue as resolved
          const generator = new ReportGenerator();
          const beforeResolve = Date.now();
          const resolvedIssue = generator.markIssueResolved(issue, fixInfo);
          const afterResolve = Date.now();

          // Property: Issue should be marked as RESOLVED
          expect(resolvedIssue.status).toBe('RESOLVED');

          // Property: Fix information should be recorded
          expect(resolvedIssue.fix).toBeDefined();
          expect(resolvedIssue.fix).not.toBeNull();

          // Property: Fix timestamp should be recorded and be recent
          expect(resolvedIssue.fix.timestamp).toBeDefined();
          const fixTimestamp = new Date(resolvedIssue.fix.timestamp).getTime();
          expect(fixTimestamp).toBeGreaterThanOrEqual(beforeResolve);
          expect(fixTimestamp).toBeLessThanOrEqual(afterResolve + 1000); // Allow 1 second tolerance

          // Property: Fix description should be preserved
          expect(resolvedIssue.fix.description).toBe(fixInfo.description);

          // Property: Optional fields should be preserved correctly
          if (fixInfo.commit) {
            expect(resolvedIssue.fix.commit).toBe(fixInfo.commit);
          } else {
            expect(resolvedIssue.fix.commit).toBeNull();
          }

          if (fixInfo.author) {
            expect(resolvedIssue.fix.author).toBe(fixInfo.author);
          } else {
            expect(resolvedIssue.fix.author).toBeNull();
          }

          // Property: Original issue data should be preserved
          expect(resolvedIssue.id).toBe(issue.id);
          expect(resolvedIssue.type).toBe(issue.type);
          expect(resolvedIssue.severity).toBe(issue.severity);
          expect(resolvedIssue.title).toBe(issue.title);
          expect(resolvedIssue.description).toBe(issue.description);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('fix tracking report includes all resolved issues', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of issues with mixed statuses
        fc.array(
          fc.record({
            type: fc.constantFrom('ROUTE_MISMATCH', 'DUPLICATE_PREFIX', 'AUTH_FAILURE'),
            severity: fc.constantFrom('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
            title: fc.string({ minLength: 10, maxLength: 50 }),
            description: fc.string({ minLength: 20, maxLength: 100 }),
            status: fc.constantFrom('OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'),
            hasFixInfo: fc.boolean()
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (issuesData) => {
          // Create issues
          const issues = issuesData.map(data => {
            const issue = createIssue({
              type: data.type,
              severity: data.severity,
              status: data.status,
              title: data.title,
              description: data.description,
              location: { file: 'test.js', line: 1 },
              suggestedFix: 'Fix it',
              relatedRoutes: []
            });

            // Add fix info if resolved
            if (data.status === 'RESOLVED' && data.hasFixInfo) {
              return {
                ...issue,
                fix: {
                  timestamp: new Date().toISOString(),
                  description: 'Fixed the issue',
                  commit: 'abc123',
                  author: 'Test Author'
                }
              };
            }

            return issue;
          });

          // Generate fix tracking report
          const generator = new ReportGenerator();
          const report = generator.generateFixTrackingReport(issues);

          // Property: Report should include all issues
          expect(report).toContain('# Fix Tracking Report');
          expect(report).toContain('## Status Summary');

          // Count issues by status
          const statusCounts = {
            OPEN: issues.filter(i => i.status === 'OPEN').length,
            IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS').length,
            RESOLVED: issues.filter(i => i.status === 'RESOLVED').length,
            WONT_FIX: issues.filter(i => i.status === 'WONT_FIX').length
          };

          // Property: Report should show correct counts for each status
          for (const [status, count] of Object.entries(statusCounts)) {
            expect(report).toContain(`${status} | ${count}`);
          }

          // Property: Resolved issues should have fix information in report
          const resolvedIssues = issues.filter(i => i.status === 'RESOLVED');
          if (resolvedIssues.length > 0) {
            expect(report).toContain('## ✅ Resolved Issues');
            
            for (const issue of resolvedIssues) {
              if (issue.fix) {
                expect(report).toContain(issue.title);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('updating issue status preserves issue data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom('ROUTE_MISMATCH', 'AUTH_FAILURE'),
          severity: fc.constantFrom('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
          title: fc.string({ minLength: 10, maxLength: 50 }),
          description: fc.string({ minLength: 20, maxLength: 100 })
        }),
        fc.constantFrom('OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'),
        async (issueData, newStatus) => {
          // Create issue
          const issue = createIssue({
            type: issueData.type,
            severity: issueData.severity,
            title: issueData.title,
            description: issueData.description,
            location: { file: 'test.js', line: 1 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          });

          // Update status
          const generator = new ReportGenerator();
          const updatedIssue = generator.updateIssueStatus(issue, newStatus);

          // Property: Status should be updated
          expect(updatedIssue.status).toBe(newStatus);

          // Property: All other data should be preserved
          expect(updatedIssue.id).toBe(issue.id);
          expect(updatedIssue.type).toBe(issue.type);
          expect(updatedIssue.severity).toBe(issue.severity);
          expect(updatedIssue.title).toBe(issue.title);
          expect(updatedIssue.description).toBe(issue.description);
          expect(updatedIssue.location).toEqual(issue.location);
          expect(updatedIssue.suggestedFix).toBe(issue.suggestedFix);
        }
      ),
      { numRuns: 100 }
    );
  });
});
