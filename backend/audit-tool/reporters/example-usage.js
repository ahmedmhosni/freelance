/**
 * Example usage of the ReportGenerator
 * 
 * This file demonstrates how to use the ReportGenerator to create various audit reports.
 */

const ReportGenerator = require('./ReportGenerator');
const { createAuditResults } = require('../models/AuditResults');
const { createRouteInfo } = require('../models/RouteInfo');
const { createAPICallInfo } = require('../models/APICallInfo');
const { createVerificationResult } = require('../models/VerificationResult');
const { createIssue } = require('../models/Issue');

// Create sample data
const sampleRoutes = [
  createRouteInfo({
    method: 'GET',
    path: '/api/clients',
    handler: 'ClientController.getAll',
    middleware: ['auth'],
    module: 'clients',
    isLegacy: false,
    requiresAuth: true,
    file: 'src/modules/clients/index.js'
  }),
  createRouteInfo({
    method: 'POST',
    path: '/api/clients',
    handler: 'ClientController.create',
    middleware: ['auth', 'validate'],
    module: 'clients',
    isLegacy: false,
    requiresAuth: true,
    file: 'src/modules/clients/index.js'
  }),
  createRouteInfo({
    method: 'GET',
    path: '/api/dashboard',
    handler: 'dashboardHandler',
    middleware: ['auth'],
    module: null,
    isLegacy: true,
    requiresAuth: true,
    file: 'src/routes/dashboard.js'
  })
];

const sampleFrontendCalls = [
  createAPICallInfo({
    file: 'src/features/clients/ClientList.jsx',
    line: 45,
    method: 'get',
    path: '/clients',
    component: 'ClientList',
    hasBaseURL: true,
    fullPath: '/api/clients'
  }),
  createAPICallInfo({
    file: 'src/features/clients/ClientForm.jsx',
    line: 78,
    method: 'post',
    path: '/clients',
    component: 'ClientForm',
    hasBaseURL: true,
    fullPath: '/api/clients'
  })
];

const sampleVerificationResults = [
  createVerificationResult({
    route: sampleRoutes[0],
    success: true,
    statusCode: 200,
    responseTime: 145,
    timestamp: new Date().toISOString(),
    request: {
      method: 'GET',
      path: '/api/clients',
      headers: { authorization: 'Bearer token' },
      body: {}
    },
    response: {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: [] }
    },
    errors: []
  }),
  createVerificationResult({
    route: sampleRoutes[1],
    success: false,
    statusCode: 400,
    responseTime: 89,
    timestamp: new Date().toISOString(),
    request: {
      method: 'POST',
      path: '/api/clients',
      headers: { authorization: 'Bearer token' },
      body: { name: '' }
    },
    response: {
      status: 400,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Validation failed' }
    },
    errors: ['Name is required']
  })
];

const sampleIssues = [
  createIssue({
    type: 'VALIDATION_ERROR',
    severity: 'HIGH',
    status: 'OPEN',
    title: 'Client creation validation failing',
    description: 'The client creation endpoint is rejecting valid data due to overly strict validation rules.',
    location: {
      file: 'src/modules/clients/validators/ClientValidator.js',
      line: 23
    },
    suggestedFix: 'Review and adjust validation rules to accept valid client data formats.',
    relatedRoutes: [sampleRoutes[1]]
  }),
  createIssue({
    type: 'ROUTE_MISMATCH',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    title: 'Dashboard route not matched with frontend',
    description: 'The dashboard route exists in backend but no frontend component is calling it.',
    location: {
      file: 'src/routes/dashboard.js',
      line: 15
    },
    suggestedFix: 'Either remove the unused route or add frontend integration.',
    relatedRoutes: [sampleRoutes[2]],
    fix: {
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      description: 'Added frontend component to call dashboard route',
      commit: 'abc123def456',
      author: 'John Doe'
    }
  })
];

// Create audit results
const auditResults = createAuditResults({
  summary: {
    totalRoutes: 3,
    totalFrontendCalls: 2,
    matchedRoutes: 2,
    unmatchedRoutes: 1,
    passedTests: 1,
    failedTests: 1,
    issues: 2
  },
  routes: {
    modular: sampleRoutes.filter(r => !r.isLegacy),
    legacy: sampleRoutes.filter(r => r.isLegacy),
    all: sampleRoutes
  },
  frontendCalls: sampleFrontendCalls,
  matches: {
    matched: [
      { frontend: sampleFrontendCalls[0], backend: sampleRoutes[0] },
      { frontend: sampleFrontendCalls[1], backend: sampleRoutes[1] }
    ],
    unmatchedFrontend: [],
    unmatchedBackend: [sampleRoutes[2]]
  },
  verificationResults: sampleVerificationResults,
  issues: sampleIssues,
  timestamp: new Date().toISOString()
});

// Create report generator
const generator = new ReportGenerator();

// Generate all report types
console.log('='.repeat(80));
console.log('SUMMARY REPORT');
console.log('='.repeat(80));
console.log(generator.generateSummaryReport(auditResults));
console.log('\n\n');

console.log('='.repeat(80));
console.log('ROUTE REPORT');
console.log('='.repeat(80));
console.log(generator.generateRouteReport(auditResults));
console.log('\n\n');

console.log('='.repeat(80));
console.log('ISSUE REPORT');
console.log('='.repeat(80));
console.log(generator.generateIssueReport(auditResults));
console.log('\n\n');

console.log('='.repeat(80));
console.log('FIX TRACKING REPORT');
console.log('='.repeat(80));
console.log(generator.generateFixTrackingReport(auditResults.issues));
console.log('\n\n');

console.log('='.repeat(80));
console.log('COMPREHENSIVE REPORT');
console.log('='.repeat(80));
console.log(generator.generateComprehensiveReport(auditResults, {
  version: '1.0.0',
  environment: 'development',
  auditType: 'full'
}));
