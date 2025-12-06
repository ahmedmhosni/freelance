/**
 * @typedef {Object} RouteInfo
 * @property {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} method - HTTP method
 * @property {string} path - Route path (e.g., '/api/clients')
 * @property {string} handler - Handler function name
 * @property {string[]} middleware - Applied middleware
 * @property {string | null} module - Module name if modular
 * @property {boolean} isLegacy - True if from routes/ directory
 * @property {boolean} requiresAuth - True if auth middleware applied
 * @property {string} file - Source file path
 */

/**
 * Creates a RouteInfo object
 * @param {Object} options - Route information
 * @returns {RouteInfo}
 */
function createRouteInfo(options) {
  return {
    method: options.method,
    path: options.path,
    handler: options.handler || 'unknown',
    middleware: options.middleware || [],
    module: options.module || null,
    isLegacy: options.isLegacy || false,
    requiresAuth: options.requiresAuth || false,
    file: options.file || 'unknown'
  };
}

module.exports = { createRouteInfo };
