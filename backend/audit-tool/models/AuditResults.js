/**
 * @typedef {Object} AuditResults
 * @property {Object} summary - Summary statistics
 * @property {number} summary.totalRoutes - Total routes discovered
 * @property {number} summary.totalFrontendCalls - Total frontend API calls
 * @property {number} summary.matchedRoutes - Matched routes count
 * @property {number} summary.unmatchedRoutes - Unmatched routes count
 * @property {number} summary.passedTests - Passed tests count
 * @property {number} summary.failedTests - Failed tests count
 * @property {number} summary.issues - Total issues count
 * @property {Object} routes - Route information
 * @property {import('./RouteInfo').RouteInfo[]} routes.modular - Modular routes
 * @property {import('./RouteInfo').RouteInfo[]} routes.legacy - Legacy routes
 * @property {import('./RouteInfo').RouteInfo[]} routes.all - All routes
 * @property {import('./APICallInfo').APICallInfo[]} frontendCalls - Frontend API calls
 * @property {Object} matches - Matching results
 * @property {Array<{frontend: import('./APICallInfo').APICallInfo, backend: import('./RouteInfo').RouteInfo}>} matches.matched - Matched pairs
 * @property {import('./APICallInfo').APICallInfo[]} matches.unmatchedFrontend - Unmatched frontend calls
 * @property {import('./RouteInfo').RouteInfo[]} matches.unmatchedBackend - Unmatched backend routes
 * @property {import('./VerificationResult').VerificationResult[]} verificationResults - Verification results
 * @property {import('./Issue').Issue[]} issues - Discovered issues
 * @property {string} timestamp - ISO timestamp
 */

/**
 * Creates an AuditResults object
 * @param {Object} options - Audit results information
 * @returns {AuditResults}
 */
function createAuditResults(options = {}) {
  return {
    summary: {
      totalRoutes: options.summary?.totalRoutes || 0,
      totalFrontendCalls: options.summary?.totalFrontendCalls || 0,
      matchedRoutes: options.summary?.matchedRoutes || 0,
      unmatchedRoutes: options.summary?.unmatchedRoutes || 0,
      passedTests: options.summary?.passedTests || 0,
      failedTests: options.summary?.failedTests || 0,
      issues: options.summary?.issues || 0
    },
    routes: {
      modular: options.routes?.modular || [],
      legacy: options.routes?.legacy || [],
      all: options.routes?.all || []
    },
    frontendCalls: options.frontendCalls || [],
    matches: {
      matched: options.matches?.matched || [],
      unmatchedFrontend: options.matches?.unmatchedFrontend || [],
      unmatchedBackend: options.matches?.unmatchedBackend || []
    },
    verificationResults: options.verificationResults || [],
    issues: options.issues || [],
    timestamp: options.timestamp || new Date().toISOString()
  };
}

module.exports = { createAuditResults };
