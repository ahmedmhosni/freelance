/**
 * Path Normalization Utilities
 * 
 * Provides utilities for normalizing API paths to enable consistent comparison
 * between frontend API calls and backend routes. Supports Express-style parameters (:id),
 * template literal parameters (${id}), and various ID formats (numeric, UUID, ObjectId).
 * 
 * @module pathNormalizer
 */

/**
 * Normalizes a path for comparison by removing query parameters, hash fragments,
 * and standardizing slashes. Handles different path formats (/api/clients vs /clients).
 * 
 * Enhanced to handle:
 * - Query parameters (strips everything after ?)
 * - Hash fragments (strips everything after #)
 * - :apiUrl prefix (converts to /api)
 * - Trailing slashes (removes them)
 * - Multiple consecutive slashes (normalizes to single slash)
 * 
 * @param {string} path - Path to normalize
 * @returns {string} Normalized path, or empty string if input is invalid
 * @example
 * normalizePath("/api/tasks?status=active") // Returns "/api/tasks"
 * normalizePath("/api/tasks/") // Returns "/api/tasks"
 * normalizePath(":apiUrl/tasks") // Returns "/api/tasks"
 */
function normalizePath(path) {
  if (!path || typeof path !== 'string') {
    return '';
  }

  let normalized = path.trim();

  // Strip query parameters (everything after ?)
  const queryIndex = normalized.indexOf('?');
  if (queryIndex !== -1) {
    normalized = normalized.substring(0, queryIndex);
  }

  // Strip hash fragments (everything after #)
  const hashIndex = normalized.indexOf('#');
  if (hashIndex !== -1) {
    normalized = normalized.substring(0, hashIndex);
  }

  // Handle :apiUrl prefix - this could resolve to either /api or empty
  // We'll treat it as /api for matching purposes
  if (normalized.startsWith(':apiUrl/')) {
    normalized = '/api/' + normalized.substring(8); // Remove :apiUrl/ (8 chars) and add /api/
  }

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');

  // Ensure path starts with /
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  // Normalize multiple slashes to single slash
  normalized = normalized.replace(/\/+/g, '/');

  // Don't add /api prefix if path already has it or if it's a public route
  // Public routes are those that exist without /api prefix (like /changelog, /maintenance)
  // We'll handle this in the matching logic instead

  return normalized;
}

/**
 * Removes the /api prefix from a path
 * 
 * @param {string} path - Path to process
 * @returns {string} Path without /api prefix
 */
function removeApiPrefix(path) {
  if (!path || typeof path !== 'string') {
    return '';
  }

  let result = path.trim();

  // Remove /api prefix
  if (result.startsWith('/api/')) {
    result = result.substring(4); // Remove '/api'
  } else if (result === '/api') {
    result = '/';
  }

  // Ensure result starts with /
  if (!result.startsWith('/')) {
    result = '/' + result;
  }

  return result;
}

/**
 * Adds the /api prefix to a path if not present
 * 
 * @param {string} path - Path to process
 * @returns {string} Path with /api prefix
 */
function addApiPrefix(path) {
  if (!path || typeof path !== 'string') {
    return '/api';
  }

  let result = path.trim();

  // Ensure path starts with /
  if (!result.startsWith('/')) {
    result = '/' + result;
  }

  // Add /api prefix if not present
  if (!result.startsWith('/api/') && result !== '/api') {
    result = '/api' + result;
  }

  return result;
}

/**
 * Checks if a path segment is a parameter placeholder.
 * 
 * Enhanced to detect multiple parameter formats:
 * - Express-style: :id, :userId, :taskId
 * - Template literals: ${id}, ${userId}, ${taskId}
 * - Numeric IDs: 123, 456789
 * - UUIDs: 550e8400-e29b-41d4-a716-446655440000
 * - MongoDB ObjectIds: 507f1f77bcf86cd799439011
 * 
 * @param {string} segment - Path segment to check
 * @returns {boolean} True if segment is a parameter placeholder
 * @example
 * isParameter(":id") // Returns true
 * isParameter("${userId}") // Returns true
 * isParameter("123") // Returns true
 * isParameter("tasks") // Returns false
 */
function isParameter(segment) {
  if (!segment || typeof segment !== 'string') {
    return false;
  }

  // Check for Express-style parameters (:id, :userId, etc.)
  if (segment.startsWith(':')) {
    return true;
  }

  // Check for template literal parameters (${id}, ${userId}, etc.)
  if (/^\$\{[\w]+\}$/.test(segment)) {
    return true;
  }

  // Check for common parameter patterns
  const paramPatterns = [
    /^[0-9]+$/, // Numeric ID
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, // UUID
    /^[a-f0-9]{24}$/i // MongoDB ObjectId
  ];

  return paramPatterns.some(pattern => pattern.test(segment));
}

/**
 * Extracts parameter names from a path.
 * 
 * NEW FUNCTION: Added to support detailed parameter analysis.
 * Supports both Express-style (:id) and template literal (${id}) formats.
 * Does not extract numeric IDs, UUIDs, or ObjectIds - only named parameters.
 * 
 * @param {string} path - Path to extract parameters from
 * @returns {string[]} Array of parameter names (without : or ${} wrappers)
 * @example
 * extractParameterNames("/api/tasks/:id") // Returns ["id"]
 * extractParameterNames("/api/tasks/${taskId}/comments/${commentId}") // Returns ["taskId", "commentId"]
 * extractParameterNames("/api/tasks/123") // Returns [] (numeric IDs not extracted)
 */
function extractParameterNames(path) {
  if (!path || typeof path !== 'string') {
    return [];
  }

  const paramNames = [];
  const segments = path.split('/').filter(s => s);

  for (const segment of segments) {
    // Extract Express-style parameter names (:id, :userId, etc.)
    if (segment.startsWith(':')) {
      paramNames.push(segment.substring(1));
    }
    // Extract template literal parameter names (${id}, ${userId}, etc.)
    else {
      const match = segment.match(/^\$\{([\w]+)\}$/);
      if (match) {
        paramNames.push(match[1]);
      }
    }
  }

  return paramNames;
}

/**
 * Compares two paths considering parameter placeholders.
 * Returns true if paths match, treating parameters as wildcards.
 * 
 * Automatically tries multiple variations:
 * - Direct comparison
 * - With /api prefix added to either path
 * - With /api prefix removed from either path
 * 
 * This flexible matching ensures routes are matched regardless of /api prefix differences.
 * 
 * @param {string} path1 - First path to compare
 * @param {string} path2 - Second path to compare
 * @returns {boolean} True if paths match (considering parameters and /api variations)
 * @example
 * pathsMatch("/api/tasks/:id", "/api/tasks/123") // Returns true
 * pathsMatch("/tasks/:id", "/api/tasks/123") // Returns true (handles /api prefix)
 * pathsMatch("/api/tasks/${id}", "/api/tasks/123") // Returns true (template literals)
 */
function pathsMatch(path1, path2) {
  if (!path1 || !path2) {
    return false;
  }

  // Normalize both paths first
  const normalized1 = normalizePath(path1);
  const normalized2 = normalizePath(path2);

  // Try direct match
  if (comparePathSegments(normalized1, normalized2)) {
    return true;
  }

  // Try matching with /api prefix added to path1
  if (!normalized1.startsWith('/api/')) {
    const withApi1 = '/api' + normalized1;
    if (comparePathSegments(withApi1, normalized2)) {
      return true;
    }
  }

  // Try matching with /api prefix added to path2
  if (!normalized2.startsWith('/api/')) {
    const withApi2 = '/api' + normalized2;
    if (comparePathSegments(normalized1, withApi2)) {
      return true;
    }
  }

  // Try matching without /api prefix on path1
  if (normalized1.startsWith('/api/')) {
    const withoutApi1 = normalized1.substring(4);
    if (comparePathSegments(withoutApi1, normalized2)) {
      return true;
    }
  }

  // Try matching without /api prefix on path2
  if (normalized2.startsWith('/api/')) {
    const withoutApi2 = normalized2.substring(4);
    if (comparePathSegments(normalized1, withoutApi2)) {
      return true;
    }
  }

  return false;
}

/**
 * Compares path segments for matching
 * @private
 * @param {string} path1 - First path
 * @param {string} path2 - Second path
 * @returns {boolean} True if segments match
 */
function comparePathSegments(path1, path2) {
  // Check for exact match
  if (path1 === path2) {
    return true;
  }

  // Split paths into segments
  const segments1 = path1.split('/').filter(s => s);
  const segments2 = path2.split('/').filter(s => s);

  // Paths must have same number of segments
  if (segments1.length !== segments2.length) {
    return false;
  }

  // Compare each segment
  for (let i = 0; i < segments1.length; i++) {
    const seg1 = segments1[i];
    const seg2 = segments2[i];

    // If either segment is a parameter, it's a match
    if (isParameter(seg1) || isParameter(seg2)) {
      continue;
    }

    // Otherwise, segments must match exactly
    if (seg1 !== seg2) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts path segments from a path
 * 
 * @param {string} path - Path to split
 * @returns {string[]} Array of path segments
 */
function getPathSegments(path) {
  if (!path || typeof path !== 'string') {
    return [];
  }

  const normalized = normalizePath(path);
  return normalized.split('/').filter(s => s);
}

/**
 * Checks if a path has duplicate /api prefixes
 * 
 * @param {string} path - Path to check
 * @returns {boolean} True if path has duplicate /api prefixes
 */
function hasDuplicateApiPrefix(path) {
  if (!path || typeof path !== 'string') {
    return false;
  }

  return path.includes('/api/api');
}

/**
 * Fixes duplicate /api prefixes in a path
 * 
 * @param {string} path - Path to fix
 * @returns {string} Path with duplicate prefixes removed
 */
function fixDuplicateApiPrefix(path) {
  if (!path || typeof path !== 'string') {
    return '';
  }

  let result = path;

  // Replace all /api/api with /api
  while (result.includes('/api/api')) {
    result = result.replace('/api/api', '/api');
  }

  return result;
}

/**
 * Compares two paths with detailed mismatch reason.
 * 
 * NEW FUNCTION: Added to provide detailed diagnostics for route matching.
 * Returns both match result and specific reason for mismatch, enabling better debugging.
 * 
 * Possible reasons:
 * - 'exact-match': Paths are identical
 * - 'normalized-match': Paths match after normalization
 * - 'parameter-match': Paths match with parameter substitution
 * - 'method-mismatch': Paths match but HTTP methods differ
 * - 'path-structure-mismatch': Different number of segments or mismatched segments
 * - 'parameter-count-mismatch': Too many parameter differences
 * - 'invalid-path-1' or 'invalid-path-2': Invalid input
 * 
 * @param {string} path1 - First path to compare
 * @param {string} path2 - Second path to compare
 * @param {string} [method1=null] - HTTP method for first path (optional, for method checking)
 * @param {string} [method2=null] - HTTP method for second path (optional, for method checking)
 * @returns {Object} Match result: { match: boolean, reason: string, confidence?: string, details?: string }
 * @example
 * pathsMatchWithReason("/api/tasks/:id", "/api/tasks/123", "GET", "GET")
 * // Returns { match: true, reason: "parameter-match", confidence: "parameter-match" }
 * 
 * pathsMatchWithReason("/api/tasks", "/api/tasks", "GET", "POST")
 * // Returns { match: false, reason: "method-mismatch" }
 */
function pathsMatchWithReason(path1, path2, method1 = null, method2 = null) {
  // Validate inputs
  if (!path1 || typeof path1 !== 'string') {
    return { match: false, reason: 'invalid-path-1' };
  }
  if (!path2 || typeof path2 !== 'string') {
    return { match: false, reason: 'invalid-path-2' };
  }

  // Check method match if both methods are provided
  // Treat empty strings as valid methods (different from null/undefined)
  const hasMethod1 = method1 !== null && method1 !== undefined;
  const hasMethod2 = method2 !== null && method2 !== undefined;
  
  if (hasMethod1 && hasMethod2) {
    const normalizedMethod1 = method1.toUpperCase();
    const normalizedMethod2 = method2.toUpperCase();
    
    if (normalizedMethod1 !== normalizedMethod2) {
      return { match: false, reason: 'method-mismatch' };
    }
  }

  // Normalize both paths
  const normalized1 = normalizePath(path1);
  const normalized2 = normalizePath(path2);

  // Try direct match
  const directMatch = comparePathSegmentsWithReason(normalized1, normalized2);
  if (directMatch.match) {
    return { match: true, reason: 'exact-match', confidence: 'exact' };
  }

  // Try matching with /api prefix variations
  const apiVariations = [
    { p1: normalized1, p2: normalized2 },
    { p1: !normalized1.startsWith('/api/') ? '/api' + normalized1 : null, p2: normalized2 },
    { p1: normalized1, p2: !normalized2.startsWith('/api/') ? '/api' + normalized2 : null },
    { p1: normalized1.startsWith('/api/') ? normalized1.substring(4) : null, p2: normalized2 },
    { p1: normalized1, p2: normalized2.startsWith('/api/') ? normalized2.substring(4) : null }
  ];

  for (const variation of apiVariations) {
    if (variation.p1 && variation.p2) {
      const result = comparePathSegmentsWithReason(variation.p1, variation.p2);
      if (result.match) {
        return { match: true, reason: 'normalized-match', confidence: result.confidence || 'normalized' };
      }
    }
  }

  // If we got here, paths don't match - return the reason from direct comparison
  return directMatch;
}

/**
 * Compares path segments with detailed reason
 * @private
 * @param {string} path1 - First path
 * @param {string} path2 - Second path
 * @returns {Object} Match result with reason
 */
function comparePathSegmentsWithReason(path1, path2) {
  // Check for exact match
  if (path1 === path2) {
    return { match: true, reason: 'exact-match', confidence: 'exact' };
  }

  // Split paths into segments
  const segments1 = path1.split('/').filter(s => s);
  const segments2 = path2.split('/').filter(s => s);

  // Check if paths have different number of segments
  if (segments1.length !== segments2.length) {
    return { 
      match: false, 
      reason: 'path-structure-mismatch',
      details: `Different segment counts: ${segments1.length} vs ${segments2.length}`
    };
  }

  // Count parameters in each path
  let paramCount1 = 0;
  let paramCount2 = 0;
  let mismatchedSegments = [];

  // Compare each segment
  for (let i = 0; i < segments1.length; i++) {
    const seg1 = segments1[i];
    const seg2 = segments2[i];

    const isPar1 = isParameter(seg1);
    const isPar2 = isParameter(seg2);

    if (isPar1) paramCount1++;
    if (isPar2) paramCount2++;

    // If either segment is a parameter, it's a match
    if (isPar1 || isPar2) {
      continue;
    }

    // Otherwise, segments must match exactly
    if (seg1 !== seg2) {
      mismatchedSegments.push({ index: i, seg1, seg2 });
    }
  }

  // If we found mismatched non-parameter segments
  if (mismatchedSegments.length > 0) {
    return {
      match: false,
      reason: 'path-structure-mismatch',
      details: `Mismatched segments at positions: ${mismatchedSegments.map(m => m.index).join(', ')}`
    };
  }

  // Check if parameter counts are significantly different
  if (Math.abs(paramCount1 - paramCount2) > segments1.length / 2) {
    return {
      match: false,
      reason: 'parameter-count-mismatch',
      details: `Parameter counts: ${paramCount1} vs ${paramCount2}`
    };
  }

  // Paths match with parameters
  return { 
    match: true, 
    reason: 'parameter-match',
    confidence: 'parameter-match'
  };
}

/**
 * Converts a path with parameters to a regex pattern.
 * Useful for matching paths with dynamic segments.
 * 
 * Converts Express-style parameters (:id, :userId) into regex patterns
 * that match any non-slash characters.
 * 
 * @param {string} path - Path with parameters (e.g., /api/clients/:id)
 * @returns {RegExp} Regular expression for matching the path pattern
 * @example
 * const regex = pathToRegex("/api/tasks/:id");
 * regex.test("/api/tasks/123") // Returns true
 * regex.test("/api/tasks/abc") // Returns true
 * regex.test("/api/tasks/123/comments") // Returns false
 */
function pathToRegex(path) {
  if (!path || typeof path !== 'string') {
    return new RegExp('^$');
  }

  const normalized = normalizePath(path);
  
  // Escape special regex characters except :
  let pattern = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Replace :param with regex pattern for matching
  pattern = pattern.replace(/:[\w]+/g, '[^/]+');
  
  // Add anchors
  pattern = '^' + pattern + '$';
  
  return new RegExp(pattern);
}

module.exports = {
  normalizePath,
  removeApiPrefix,
  addApiPrefix,
  isParameter,
  extractParameterNames,
  pathsMatch,
  pathsMatchWithReason,
  getPathSegments,
  hasDuplicateApiPrefix,
  fixDuplicateApiPrefix,
  pathToRegex
};
