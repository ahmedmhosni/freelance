/**
 * @typedef {Object} VerificationResult
 * @property {import('./RouteInfo').RouteInfo} route - Route information
 * @property {boolean} success - Whether verification succeeded
 * @property {number} statusCode - HTTP status code
 * @property {number} responseTime - Response time in milliseconds
 * @property {string} timestamp - ISO timestamp
 * @property {Object} request - Request details
 * @property {string} request.method - HTTP method
 * @property {string} request.path - Request path
 * @property {Object} request.headers - Request headers
 * @property {Object} request.body - Request body
 * @property {Object} response - Response details
 * @property {number} response.status - Response status
 * @property {Object} response.headers - Response headers
 * @property {Object} response.body - Response body
 * @property {string[]} errors - List of errors
 */

/**
 * Creates a VerificationResult object
 * @param {Object} options - Verification result information
 * @returns {VerificationResult}
 */
function createVerificationResult(options) {
  return {
    route: options.route,
    success: options.success || false,
    statusCode: options.statusCode || 0,
    responseTime: options.responseTime || 0,
    timestamp: options.timestamp || new Date().toISOString(),
    request: {
      method: options.request?.method || '',
      path: options.request?.path || '',
      headers: options.request?.headers || {},
      body: options.request?.body || {}
    },
    response: {
      status: options.response?.status || 0,
      headers: options.response?.headers || {},
      body: options.response?.body || {}
    },
    errors: options.errors || []
  };
}

module.exports = { createVerificationResult };
