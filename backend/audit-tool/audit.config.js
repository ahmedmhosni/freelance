/**
 * Audit Tool Configuration
 * 
 * This configuration file defines settings for the full system audit tool.
 * It includes paths, database settings, verification parameters, and reporting options.
 */

const path = require('path');

module.exports = {
  // Backend configuration
  backend: {
    serverPath: path.resolve(__dirname, '../src/server.js'),
    modulesPath: path.resolve(__dirname, '../src/modules'),
    routesPath: path.resolve(__dirname, '../src/routes'),
    port: process.env.PORT || 5000,
    baseURL: process.env.API_BASE_URL || 'http://localhost:5000'
  },

  // Frontend configuration
  frontend: {
    srcPath: path.resolve(__dirname, '../../frontend/src'),
    apiConfigPath: path.resolve(__dirname, '../../frontend/src/utils/api.js'),
    baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api'
  },

  // Database configuration
  database: {
    host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || process.env.DB_PORT || '5432', 10),
    database: process.env.PG_DATABASE || process.env.DB_NAME || 'roastify',
    user: process.env.PG_USER || process.env.DB_USER || 'postgres',
    password: process.env.PG_PASSWORD || process.env.DB_PASSWORD || 'postgres123',
    ssl: process.env.DB_SSL === 'true',
    // Test database settings (used for verification)
    testDatabase: process.env.TEST_DB_NAME || 'freelance_management_test'
  },

  // Verification settings
  verification: {
    timeout: parseInt(process.env.AUDIT_TIMEOUT || '5000', 10), // 5 seconds
    retries: parseInt(process.env.AUDIT_RETRIES || '3', 10),
    parallelRequests: parseInt(process.env.AUDIT_PARALLEL || '5', 10),
    // Delay between requests to avoid overwhelming the server
    requestDelay: parseInt(process.env.AUDIT_REQUEST_DELAY || '100', 10), // 100ms
    // Skip certain routes during verification
    skipRoutes: [
      '/api/health',
      '/api/status'
    ]
  },

  // Reporting configuration
  reporting: {
    outputPath: path.resolve(__dirname, './reports'),
    format: 'markdown', // 'markdown' | 'json' | 'html'
    includeStackTraces: process.env.AUDIT_INCLUDE_STACK_TRACES !== 'false',
    includeTimestamps: true,
    // Report file naming
    summaryFileName: 'audit-summary.md',
    routeReportFileName: 'route-inventory.md',
    issueReportFileName: 'issues.md',
    detailedReportFileName: 'detailed-results.json'
  },

  // Test data configuration
  testData: {
    seedFile: path.resolve(__dirname, '../seed-simple.js'),
    cleanupAfterTests: process.env.AUDIT_CLEANUP !== 'false',
    // Test user credentials
    testUser: {
      email: 'audit-test@example.com',
      password: 'AuditTest123!',
      name: 'Audit Test User'
    }
  },

  // Logging configuration
  logging: {
    level: process.env.AUDIT_LOG_LEVEL || 'info', // 'debug' | 'info' | 'warn' | 'error'
    logToFile: process.env.AUDIT_LOG_TO_FILE !== 'false',
    logFilePath: path.resolve(__dirname, './logs/audit.log'),
    logToConsole: true,
    // Colorize console output
    colorize: process.env.AUDIT_COLORIZE !== 'false'
  },

  // Security settings
  security: {
    // JWT secret for test authentication
    jwtSecret: process.env.JWT_SECRET || 'test-secret-key',
    // Skip SSL verification for local testing
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },

  // Module-specific settings
  modules: {
    // List of modules to audit (empty = all modules)
    include: [],
    // List of modules to exclude from audit
    exclude: [],
    // Expected modules in the system
    expected: [
      'auth',
      'admin',
      'clients',
      'projects',
      'tasks',
      'invoices',
      'time-tracking',
      'reports',
      'notifications'
    ]
  },

  // Performance settings
  performance: {
    // Maximum memory usage (in MB) before warning
    maxMemoryMB: 512,
    // Maximum execution time (in minutes) before warning
    maxExecutionMinutes: 30
  }
};
