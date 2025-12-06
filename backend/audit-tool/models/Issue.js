/**
 * @typedef {'ROUTE_MISMATCH' | 'DUPLICATE_PREFIX' | 'AUTH_FAILURE' | 'DATABASE_ERROR' | 'VALIDATION_ERROR' | 'MISSING_ROUTE'} IssueType
 * @typedef {'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'} IssueSeverity
 * @typedef {'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'WONT_FIX'} IssueStatus
 */

/**
 * @typedef {Object} IssueFix
 * @property {string} timestamp - ISO timestamp when fix was applied
 * @property {string} description - Description of the fix
 * @property {string} [commit] - Git commit hash if available
 * @property {string} [author] - Person who applied the fix
 */

/**
 * @typedef {Object} Issue
 * @property {string} id - Unique issue identifier
 * @property {IssueType} type - Issue type
 * @property {IssueSeverity} severity - Issue severity
 * @property {IssueStatus} status - Issue resolution status
 * @property {string} title - Issue title
 * @property {string} description - Issue description
 * @property {Object} location - Issue location
 * @property {string} location.file - File path
 * @property {number} location.line - Line number
 * @property {string} suggestedFix - Suggested fix
 * @property {import('./RouteInfo').RouteInfo[]} relatedRoutes - Related routes
 * @property {IssueFix} [fix] - Fix information if resolved
 * @property {string} createdAt - ISO timestamp when issue was created
 */

/**
 * Creates an Issue object
 * @param {Object} options - Issue information
 * @returns {Issue}
 */
function createIssue(options) {
  return {
    id: options.id || `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: options.type,
    severity: options.severity,
    status: options.status || 'OPEN',
    title: options.title,
    description: options.description,
    location: {
      file: options.location?.file || 'unknown',
      line: options.location?.line || 0
    },
    suggestedFix: options.suggestedFix || '',
    relatedRoutes: options.relatedRoutes || [],
    fix: options.fix || null,
    createdAt: options.createdAt || new Date().toISOString()
  };
}

module.exports = { createIssue };
