/**
 * @typedef {Object} APICallInfo
 * @property {string} file - Frontend file path
 * @property {number} line - Line number
 * @property {'get' | 'post' | 'put' | 'delete' | 'patch'} method - HTTP method
 * @property {string} path - API path called
 * @property {string} component - React component name
 * @property {boolean} hasBaseURL - Uses api.js base URL
 * @property {string} fullPath - Computed full path
 */

/**
 * Creates an APICallInfo object
 * @param {Object} options - API call information
 * @returns {APICallInfo}
 */
function createAPICallInfo(options) {
  return {
    file: options.file,
    line: options.line || 0,
    method: options.method,
    path: options.path,
    component: options.component || 'unknown',
    hasBaseURL: options.hasBaseURL || false,
    fullPath: options.fullPath || options.path
  };
}

module.exports = { createAPICallInfo };
