/**
 * Unit Tests for ReportGenerator
 * 
 * Tests markdown formatting, report structure, and issue categorization.
 * Requirements: 5.1, 5.2
 */

const ReportGenerator = require('../reporters/ReportGenerator');
const { createIssue } = require('../models/Issue');
const { createRouteInfo } = require('../models/RouteInfo');
const { createAPICallInfo } = require('../models/APICallInfo');
const { createAuditResults } = require('../models/AuditResults');

describe('ReportGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new ReportGenerator();
  });

  describe('generateSummaryReport - Markdown formatting', () => {
    it('should generate summary report with correct structure', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 10,
          totalFrontendCalls: 8,
          matchedRoutes: 8,
          unmatchedRoutes: 2,
          passedTests: 15,
          failedTests: 2,
          issues: 3
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [
          createIssue({
            id: '1',
            type: 'ROUTE_MISMATCH',
            severity: 'HIGH',
            title: 'Test Issue',
            description: 'Test description',
            location: { file: 'test.js', line: 10 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          })
        ],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateSummaryReport(results);

      expect(report).toContain('# Audit Summary Report');
      expect(report).toContain('## Overall Status:');
      expect(report).toContain('## 📍 Route Discovery');
      expect(report).toContain('## 🧪 Verification Results');
      expect(report).toContain('## 🔍 Issues Detected');
      expect(report).toContain('## 💡 Recommendations');
    });

    it('should include correct metrics in summary', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 20,
          totalFrontendCalls: 18,
          matchedRoutes: 18,
          unmatchedRoutes: 2,
          passedTests: 25,
          failedTests: 0,
          issues: 0
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateSummaryReport(results);

      expect(report).toContain('Total Routes | 20');
      expect(report).toContain('Frontend API Calls | 18');
      expect(report).toContain('Matched Routes | 18');
      expect(report).toContain('Tests Passed | 25');
    });

    it('should show EXCELLENT status when no issues', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 10,
          totalFrontendCalls: 10,
          matchedRoutes: 10,
          unmatchedRoutes: 0,
          passedTests: 20,
          failedTests: 0,
          issues: 0
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateSummaryReport(results);

      expect(report).toContain('EXCELLENT');
      expect(report).toContain('✅');
    });

    it('should show NEEDS ATTENTION status when critical issues exist', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 10,
          totalFrontendCalls: 10,
          matchedRoutes: 5,
          unmatchedRoutes: 5,
          passedTests: 10,
          failedTests: 5,
          issues: 5
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [
          createIssue({
            id: '1',
            type: 'ROUTE_MISMATCH',
            severity: 'CRITICAL',
            title: 'Critical Issue',
            description: 'Critical description',
            location: { file: 'test.js', line: 10 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          })
        ],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateSummaryReport(results);

      expect(report).toContain('NEEDS ATTENTION');
      expect(report).toContain('❌');
    });
  });

  describe('generateRouteReport - Report structure', () => {
    it('should generate route report with correct sections', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 2,
          totalFrontendCalls: 2,
          matchedRoutes: 2,
          unmatchedRoutes: 0,
          passedTests: 0,
          failedTests: 0,
          issues: 0
        },
        routes: {
          all: [
            createRouteInfo({
              method: 'GET',
              path: '/api/clients',
              handler: 'getClients',
              middleware: ['authenticateToken'],
              module: 'clients',
              isLegacy: false,
              requiresAuth: true,
              file: 'ClientController.js'
            })
          ],
          modular: [
            createRouteInfo({
              method: 'GET',
              path: '/api/clients',
              handler: 'getClients',
              middleware: ['authenticateToken'],
              module: 'clients',
              isLegacy: false,
              requiresAuth: true,
              file: 'ClientController.js'
            })
          ],
          legacy: []
        },
        frontendCalls: [],
        matches: {
          matched: [],
          unmatchedFrontend: [],
          unmatchedBackend: []
        },
        verificationResults: [],
        issues: [],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateRouteReport(results);

      expect(report).toContain('# Detailed Route Inventory Report');
      expect(report).toContain('## Table of Contents');
      expect(report).toContain('## Modular Routes');
      expect(report).toContain('## Legacy Routes');
      expect(report).toContain('## Frontend-Backend Matches');
      expect(report).toContain('## Unmatched Backend Routes');
      expect(report).toContain('## Unmatched Frontend Calls');
    });

    it('should group routes by module', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 2,
          totalFrontendCalls: 0,
          matchedRoutes: 0,
          unmatchedRoutes: 2,
          passedTests: 0,
          failedTests: 0,
          issues: 0
        },
        routes: {
          all: [],
          modular: [
            createRouteInfo({
              method: 'GET',
              path: '/api/clients',
              handler: 'getClients',
              middleware: [],
              module: 'clients',
              isLegacy: false,
              requiresAuth: true,
              file: 'ClientController.js'
            }),
            createRouteInfo({
              method: 'GET',
              path: '/api/projects',
              handler: 'getProjects',
              middleware: [],
              module: 'projects',
              isLegacy: false,
              requiresAuth: true,
              file: 'ProjectController.js'
            })
          ],
          legacy: []
        },
        frontendCalls: [],
        matches: {
          matched: [],
          unmatchedFrontend: [],
          unmatchedBackend: []
        },
        verificationResults: [],
        issues: [],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateRouteReport(results);

      expect(report).toContain('### Module: clients');
      expect(report).toContain('### Module: projects');
    });

    it('should display matched routes correctly', () => {
      const frontendCall = createAPICallInfo({
        file: 'Clients.jsx',
        line: 10,
        method: 'get',
        path: '/clients',
        component: 'Clients',
        hasBaseURL: true,
        fullPath: '/api/clients'
      });

      const backendRoute = createRouteInfo({
        method: 'GET',
        path: '/api/clients',
        handler: 'getClients',
        middleware: [],
        module: 'clients',
        isLegacy: false,
        requiresAuth: true,
        file: 'ClientController.js'
      });

      const results = createAuditResults({
        summary: {
          totalRoutes: 1,
          totalFrontendCalls: 1,
          matchedRoutes: 1,
          unmatchedRoutes: 0,
          passedTests: 0,
          failedTests: 0,
          issues: 0
        },
        routes: {
          all: [backendRoute],
          modular: [backendRoute],
          legacy: []
        },
        frontendCalls: [frontendCall],
        matches: {
          matched: [{ frontend: frontendCall, backend: backendRoute }],
          unmatchedFrontend: [],
          unmatchedBackend: []
        },
        verificationResults: [],
        issues: [],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateRouteReport(results);

      expect(report).toContain('Clients');
      expect(report).toContain('getClients');
      expect(report).toContain('/clients');
    });
  });

  describe('generateIssueReport - Issue categorization', () => {
    it('should generate issue report with correct structure', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 0,
          totalFrontendCalls: 0,
          matchedRoutes: 0,
          unmatchedRoutes: 0,
          passedTests: 0,
          failedTests: 0,
          issues: 2
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [
          createIssue({
            id: '1',
            type: 'ROUTE_MISMATCH',
            severity: 'CRITICAL',
            title: 'Critical Issue',
            description: 'Critical description',
            location: { file: 'test.js', line: 10 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          }),
          createIssue({
            id: '2',
            type: 'DUPLICATE_PREFIX',
            severity: 'HIGH',
            title: 'High Issue',
            description: 'High description',
            location: { file: 'test2.js', line: 20 },
            suggestedFix: 'Fix it too',
            relatedRoutes: []
          })
        ],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateIssueReport(results);

      expect(report).toContain('# Issue Report');
      expect(report).toContain('## Summary by Severity');
      expect(report).toContain('## Table of Contents');
      expect(report).toContain('## 🔴 Critical Issues');
      expect(report).toContain('## 🟠 High Priority Issues');
    });

    it('should categorize issues by severity', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 0,
          totalFrontendCalls: 0,
          matchedRoutes: 0,
          unmatchedRoutes: 0,
          passedTests: 0,
          failedTests: 0,
          issues: 4
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [
          createIssue({
            id: '1',
            type: 'ROUTE_MISMATCH',
            severity: 'CRITICAL',
            title: 'Critical Issue',
            description: 'Critical description',
            location: { file: 'test.js', line: 10 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          }),
          createIssue({
            id: '2',
            type: 'DUPLICATE_PREFIX',
            severity: 'HIGH',
            title: 'High Issue',
            description: 'High description',
            location: { file: 'test2.js', line: 20 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          }),
          createIssue({
            id: '3',
            type: 'AUTH_FAILURE',
            severity: 'MEDIUM',
            title: 'Medium Issue',
            description: 'Medium description',
            location: { file: 'test3.js', line: 30 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          }),
          createIssue({
            id: '4',
            type: 'VALIDATION_ERROR',
            severity: 'LOW',
            title: 'Low Issue',
            description: 'Low description',
            location: { file: 'test4.js', line: 40 },
            suggestedFix: 'Fix it',
            relatedRoutes: []
          })
        ],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateIssueReport(results);

      expect(report).toContain('🔴 Critical | 1');
      expect(report).toContain('🟠 High | 1');
      expect(report).toContain('🟡 Medium | 1');
      expect(report).toContain('🟢 Low | 1');
    });

    it('should format individual issues correctly', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 0,
          totalFrontendCalls: 0,
          matchedRoutes: 0,
          unmatchedRoutes: 0,
          passedTests: 0,
          failedTests: 0,
          issues: 1
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [
          createIssue({
            id: 'issue-123',
            type: 'ROUTE_MISMATCH',
            severity: 'HIGH',
            title: 'Route Mismatch Detected',
            description: 'Frontend call does not match backend route',
            location: { file: 'Clients.jsx', line: 42 },
            suggestedFix: 'Update the API path to /api/clients',
            relatedRoutes: []
          })
        ],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateIssueReport(results);

      expect(report).toContain('Route Mismatch Detected');
      expect(report).toContain('issue-123');
      expect(report).toContain('ROUTE_MISMATCH');
      expect(report).toContain('Frontend call does not match backend route');
      expect(report).toContain('Clients.jsx');
      expect(report).toContain('Line:** 42');
      expect(report).toContain('Update the API path to /api/clients');
    });

    it('should handle no issues gracefully', () => {
      const results = createAuditResults({
        summary: {
          totalRoutes: 0,
          totalFrontendCalls: 0,
          matchedRoutes: 0,
          unmatchedRoutes: 0,
          passedTests: 0,
          failedTests: 0,
          issues: 0
        },
        routes: { all: [], modular: [], legacy: [] },
        frontendCalls: [],
        matches: { matched: [], unmatchedFrontend: [], unmatchedBackend: [] },
        verificationResults: [],
        issues: [],
        timestamp: new Date().toISOString()
      });

      const report = generator.generateIssueReport(results);

      expect(report).toContain('No issues detected!');
      expect(report).toContain('✅');
    });
  });

  describe('generateFixTrackingReport', () => {
    it('should generate fix tracking report with status groups', () => {
      const issues = [
        createIssue({
          id: '1',
          type: 'ROUTE_MISMATCH',
          severity: 'HIGH',
          title: 'Open Issue',
          description: 'Description',
          location: { file: 'test.js', line: 10 },
          suggestedFix: 'Fix it',
          relatedRoutes: [],
          status: 'OPEN'
        }),
        createIssue({
          id: '2',
          type: 'DUPLICATE_PREFIX',
          severity: 'MEDIUM',
          title: 'Resolved Issue',
          description: 'Description',
          location: { file: 'test2.js', line: 20 },
          suggestedFix: 'Fix it',
          relatedRoutes: [],
          status: 'RESOLVED'
        })
      ];

      const report = generator.generateFixTrackingReport(issues);

      expect(report).toContain('# Fix Tracking Report');
      expect(report).toContain('## Status Summary');
      expect(report).toContain('## ✅ Resolved Issues');
      expect(report).toContain('## 📋 Open Issues');
    });

    it('should calculate status percentages correctly', () => {
      const issues = [
        createIssue({
          id: '1',
          type: 'ROUTE_MISMATCH',
          severity: 'HIGH',
          title: 'Issue 1',
          description: 'Description',
          location: { file: 'test.js', line: 10 },
          suggestedFix: 'Fix it',
          relatedRoutes: [],
          status: 'OPEN'
        }),
        createIssue({
          id: '2',
          type: 'DUPLICATE_PREFIX',
          severity: 'MEDIUM',
          title: 'Issue 2',
          description: 'Description',
          location: { file: 'test2.js', line: 20 },
          suggestedFix: 'Fix it',
          relatedRoutes: [],
          status: 'RESOLVED'
        }),
        createIssue({
          id: '3',
          type: 'AUTH_FAILURE',
          severity: 'LOW',
          title: 'Issue 3',
          description: 'Description',
          location: { file: 'test3.js', line: 30 },
          suggestedFix: 'Fix it',
          relatedRoutes: [],
          status: 'RESOLVED'
        })
      ];

      const report = generator.generateFixTrackingReport(issues);

      expect(report).toContain('OPEN | 1 | 33.3%');
      expect(report).toContain('RESOLVED | 2 | 66.7%');
    });
  });

  describe('Issue status management', () => {
    it('should mark issue as resolved', () => {
      const issue = createIssue({
        id: '1',
        type: 'ROUTE_MISMATCH',
        severity: 'HIGH',
        title: 'Test Issue',
        description: 'Description',
        location: { file: 'test.js', line: 10 },
        suggestedFix: 'Fix it',
        relatedRoutes: [],
        status: 'OPEN'
      });

      const fixInfo = {
        description: 'Fixed the route mismatch',
        commit: 'abc123',
        author: 'John Doe'
      };

      const resolved = generator.markIssueResolved(issue, fixInfo);

      expect(resolved.status).toBe('RESOLVED');
      expect(resolved.fix).toBeDefined();
      expect(resolved.fix.description).toBe('Fixed the route mismatch');
      expect(resolved.fix.commit).toBe('abc123');
      expect(resolved.fix.author).toBe('John Doe');
    });

    it('should update issue status', () => {
      const issue = createIssue({
        id: '1',
        type: 'ROUTE_MISMATCH',
        severity: 'HIGH',
        title: 'Test Issue',
        description: 'Description',
        location: { file: 'test.js', line: 10 },
        suggestedFix: 'Fix it',
        relatedRoutes: [],
        status: 'OPEN'
      });

      const updated = generator.updateIssueStatus(issue, 'IN_PROGRESS');

      expect(updated.status).toBe('IN_PROGRESS');
    });
  });

  describe('Helper methods', () => {
    it('should group issues by severity', () => {
      const issues = [
        createIssue({
          id: '1',
          type: 'ROUTE_MISMATCH',
          severity: 'CRITICAL',
          title: 'Issue 1',
          description: 'Description',
          location: { file: 'test.js', line: 10 },
          suggestedFix: 'Fix it',
          relatedRoutes: []
        }),
        createIssue({
          id: '2',
          type: 'DUPLICATE_PREFIX',
          severity: 'HIGH',
          title: 'Issue 2',
          description: 'Description',
          location: { file: 'test2.js', line: 20 },
          suggestedFix: 'Fix it',
          relatedRoutes: []
        }),
        createIssue({
          id: '3',
          type: 'AUTH_FAILURE',
          severity: 'HIGH',
          title: 'Issue 3',
          description: 'Description',
          location: { file: 'test3.js', line: 30 },
          suggestedFix: 'Fix it',
          relatedRoutes: []
        })
      ];

      const grouped = generator._groupIssuesBySeverity(issues);

      expect(grouped.CRITICAL).toBe(1);
      expect(grouped.HIGH).toBe(2);
      expect(grouped.MEDIUM).toBe(0);
      expect(grouped.LOW).toBe(0);
    });

    it('should generate unique report IDs', () => {
      const id1 = generator._generateReportId();
      const id2 = generator._generateReportId();

      expect(id1).toMatch(/^audit-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^audit-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });
});
