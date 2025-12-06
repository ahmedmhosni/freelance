/**
 * Route Matcher
 * 
 * Matches frontend API calls with backend routes with intelligent parameter detection
 * and detailed mismatch reporting.
 * 
 * Enhanced features:
 * - Supports Express-style (:id) and template literal (${id}) parameters
 * - Provides detailed mismatch analysis with categorization
 * - Generates match suggestions for similar routes
 * - Tracks match confidence levels (exact, parameter-match, normalized)
 * - Detects duplicate /api prefixes
 * 
 * @class RouteMatcher
 */

const logger = require('../utils/logger');
const {
  normalizePath,
  pathsMatch,
  pathsMatchWithReason,
  isParameter,
  hasDuplicateApiPrefix,
  fixDuplicateApiPrefix
} = require('../utils/pathNormalizer');

class RouteMatcher {
  constructor(config) {
    this.config = config;
  }

  /**
   * Matches frontend calls to backend routes with enhanced parameter detection.
   * 
   * ENHANCED: Now returns confidence levels for each match and calculates
   * improvement metrics when previous results are provided.
   * 
   * @param {Array<APICallInfo>} frontendCalls - Frontend API calls to match
   * @param {Array<RouteInfo>} backendRoutes - Backend routes to match against
   * @param {Object} [previousResults=null] - Optional previous match results for comparison
   * @returns {Object} Enhanced matching results
   * @returns {Array<Object>} returns.matched - Matched routes with confidence levels
   * @returns {Array<APICallInfo>} returns.unmatchedFrontend - Unmatched frontend calls
   * @returns {Array<RouteInfo>} returns.unmatchedBackend - Unmatched backend routes
   * @returns {Object} returns.statistics - Match statistics including improvement metrics
   * @example
   * const results = matcher.matchRoutes(frontendCalls, backendRoutes);
   * console.log(`Match rate: ${(results.statistics.matchRate * 100).toFixed(1)}%`);
   * console.log(`Matched ${results.matched.length} routes`);
   */
  matchRoutes(frontendCalls, backendRoutes, previousResults = null) {
    logger.info(`Matching ${frontendCalls.length} frontend calls to ${backendRoutes.length} backend routes`);
    
    const matched = [];
    const unmatchedFrontend = [];
    const unmatchedBackend = [...backendRoutes];

    frontendCalls.forEach(frontendCall => {
      let foundMatch = false;
      let matchConfidence = null;

      for (let i = 0; i < unmatchedBackend.length; i++) {
        const backendRoute = unmatchedBackend[i];
        
        if (this._routesMatch(frontendCall, backendRoute)) {
          // Determine confidence level
          const result = pathsMatchWithReason(frontendCall.fullPath, backendRoute.path, frontendCall.method, backendRoute.method);
          matchConfidence = result.confidence || 'exact';

          matched.push({
            frontend: frontendCall,
            backend: backendRoute,
            confidence: matchConfidence
          });
          
          // Remove matched backend route from unmatched list
          unmatchedBackend.splice(i, 1);
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        unmatchedFrontend.push(frontendCall);
      }
    });

    // Calculate statistics
    const statistics = {
      totalFrontend: frontendCalls.length,
      totalBackend: backendRoutes.length,
      matchedCount: matched.length,
      matchRate: backendRoutes.length > 0 ? (matched.length / backendRoutes.length) : 0,
      improvementFromPrevious: 0
    };

    // Calculate improvement if previous results provided
    if (previousResults && previousResults.statistics) {
      const previousMatchRate = previousResults.statistics.matchRate || 0;
      statistics.improvementFromPrevious = statistics.matchRate - previousMatchRate;
    }

    logger.info(`Matched ${matched.length} routes (${(statistics.matchRate * 100).toFixed(1)}%), ` +
      `${unmatchedFrontend.length} unmatched frontend, ${unmatchedBackend.length} unmatched backend`);

    return {
      matched,
      unmatchedFrontend,
      unmatchedBackend,
      statistics
    };
  }

  /**
   * Checks if a frontend call matches a backend route
   * @private
   * @param {APICallInfo} frontendCall - Frontend API call
   * @param {RouteInfo} backendRoute - Backend route
   * @returns {boolean} True if routes match
   */
  _routesMatch(frontendCall, backendRoute) {
    // Check if HTTP methods match (case-insensitive)
    if (frontendCall.method.toUpperCase() !== backendRoute.method.toUpperCase()) {
      return false;
    }

    // Use pathsMatch utility to compare paths with parameter support
    return pathsMatch(frontendCall.fullPath, backendRoute.path);
  }

  /**
   * Calculates similarity score between two paths
   * @private
   * @param {string} path1 - First path
   * @param {string} path2 - Second path
   * @returns {number} Similarity score between 0 and 1
   */
  _calculateSimilarity(path1, path2) {
    const normalized1 = normalizePath(path1);
    const normalized2 = normalizePath(path2);

    // Split into segments
    const segments1 = normalized1.split('/').filter(s => s);
    const segments2 = normalized2.split('/').filter(s => s);

    // If lengths are very different, similarity is low
    const lengthDiff = Math.abs(segments1.length - segments2.length);
    if (lengthDiff > 2) {
      return 0;
    }

    // Calculate segment-by-segment similarity
    const maxLength = Math.max(segments1.length, segments2.length);
    if (maxLength === 0) return 1; // Both empty

    let matchingSegments = 0;
    const minLength = Math.min(segments1.length, segments2.length);

    for (let i = 0; i < minLength; i++) {
      const seg1 = segments1[i];
      const seg2 = segments2[i];

      // Exact match
      if (seg1 === seg2) {
        matchingSegments += 1;
      }
      // Both are parameters
      else if (isParameter(seg1) && isParameter(seg2)) {
        matchingSegments += 1; // Treat as exact match
      }
      // One is parameter, one is not - this is still a good match
      else if (isParameter(seg1) || isParameter(seg2)) {
        matchingSegments += 0.95; // Very high score for parameter matching
      }
      // Partial string match (e.g., "task" vs "tasks")
      else if (seg1.includes(seg2) || seg2.includes(seg1)) {
        matchingSegments += 0.7;
      }
    }

    // Calculate final similarity score
    const similarity = matchingSegments / maxLength;
    return similarity;
  }

  /**
   * Suggests potential matches for unmatched routes based on similarity analysis.
   * 
   * NEW METHOD: Generates suggestions for routes with similarity score > 0.7.
   * Helps identify routes that are close matches but don't match exactly due to
   * method mismatches or minor path differences.
   * 
   * @param {Array<APICallInfo>} unmatchedFrontend - Unmatched frontend calls
   * @param {Array<RouteInfo>} unmatchedBackend - Unmatched backend routes
   * @returns {Array<Object>} Array of match suggestions, each containing:
   *   - frontend: The frontend call
   *   - backend: The suggested backend route
   *   - similarity: Similarity score (0-1)
   *   - reason: Why they don't match
   *   - suggestedAction: Recommended fix
   * @example
   * const suggestions = matcher.suggestMatches(unmatchedFrontend, unmatchedBackend);
   * suggestions.forEach(s => {
   *   console.log(`${s.frontend.path} might match ${s.backend.path}`);
   *   console.log(`Similarity: ${(s.similarity * 100).toFixed(1)}%`);
   *   console.log(`Action: ${s.suggestedAction}`);
   * });
   */
  suggestMatches(unmatchedFrontend, unmatchedBackend) {
    logger.info('Generating match suggestions');
    const suggestions = [];

    unmatchedFrontend.forEach(frontendCall => {
      // Find best matches for this frontend call
      const candidates = [];

      unmatchedBackend.forEach(backendRoute => {
        const similarity = this._calculateSimilarity(frontendCall.fullPath, backendRoute.path);
        
        // Only consider routes with similarity > 0.7
        if (similarity > 0.7) {
          candidates.push({
            backend: backendRoute,
            similarity: similarity
          });
        }
      });

      // Sort by similarity (highest first)
      candidates.sort((a, b) => b.similarity - a.similarity);

      // Add top suggestions
      candidates.slice(0, 3).forEach(candidate => {
        let reason = '';
        let suggestedAction = '';

        // Determine reason and suggested action
        if (frontendCall.method.toUpperCase() !== candidate.backend.method.toUpperCase()) {
          reason = 'Method mismatch - paths are similar but HTTP methods differ';
          suggestedAction = `Change frontend method from ${frontendCall.method} to ${candidate.backend.method}`;
        } else {
          reason = 'Path structure is similar but not identical';
          suggestedAction = `Review path differences: "${frontendCall.fullPath}" vs "${candidate.backend.path}"`;
        }

        suggestions.push({
          frontend: frontendCall,
          backend: candidate.backend,
          similarity: candidate.similarity,
          reason: reason,
          suggestedAction: suggestedAction
        });
      });
    });

    logger.info(`Generated ${suggestions.length} match suggestions`);
    return suggestions;
  }

  /**
   * Analyzes unmatched routes and categorizes them by mismatch reason.
   * 
   * NEW METHOD: Provides detailed diagnostics for why routes don't match.
   * Categorizes each unmatched route into one of four categories:
   * - method-mismatch: Paths match but HTTP methods differ
   * - path-structure-mismatch: Different segment counts or mismatched segments
   * - parameter-count-mismatch: Too many parameter differences
   * - no-candidate: No similar route found
   * 
   * @param {Array<APICallInfo>} unmatchedFrontend - Unmatched frontend calls
   * @param {Array<RouteInfo>} unmatchedBackend - Unmatched backend routes
   * @returns {Object} Analysis object containing:
   *   - byReason: Routes categorized by mismatch reason
   *   - statistics: Counts for each category
   * @example
   * const analysis = matcher.analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend);
   * console.log(`Method mismatches: ${analysis.statistics.methodMismatchCount}`);
   * console.log(`Path structure mismatches: ${analysis.statistics.pathStructureMismatchCount}`);
   * 
   * // Review method mismatches
   * analysis.byReason['method-mismatch'].forEach(item => {
   *   console.log(`${item.frontend.path}: ${item.details}`);
   * });
   */
  analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend) {
    logger.info('Analyzing unmatched routes');

    const analysis = {
      byReason: {
        'method-mismatch': [],
        'path-structure-mismatch': [],
        'parameter-count-mismatch': [],
        'no-candidate': []
      },
      statistics: {
        totalUnmatchedFrontend: unmatchedFrontend.length,
        totalUnmatchedBackend: unmatchedBackend.length,
        methodMismatchCount: 0,
        pathStructureMismatchCount: 0,
        parameterCountMismatchCount: 0,
        noCandidateCount: 0
      }
    };

    // Analyze each unmatched frontend call
    unmatchedFrontend.forEach(frontendCall => {
      let bestMatch = null;
      let bestReason = null;

      // Try to find the closest backend route
      for (const backendRoute of unmatchedBackend) {
        const result = pathsMatchWithReason(
          frontendCall.fullPath,
          backendRoute.path,
          frontendCall.method,
          backendRoute.method
        );

        // If we found a mismatch reason, track it
        if (!result.match && result.reason !== 'invalid-path-1' && result.reason !== 'invalid-path-2') {
          // Keep the first meaningful mismatch reason we find
          if (!bestReason) {
            bestMatch = backendRoute;
            bestReason = result.reason;
          }
        }
      }

      // Categorize based on the reason
      if (bestReason === 'method-mismatch') {
        analysis.byReason['method-mismatch'].push({
          frontend: frontendCall,
          backend: bestMatch,
          details: `Frontend: ${frontendCall.method}, Backend: ${bestMatch.method}`
        });
        analysis.statistics.methodMismatchCount++;
      } else if (bestReason === 'path-structure-mismatch') {
        analysis.byReason['path-structure-mismatch'].push({
          frontend: frontendCall,
          backend: bestMatch,
          details: 'Path segments do not match'
        });
        analysis.statistics.pathStructureMismatchCount++;
      } else if (bestReason === 'parameter-count-mismatch') {
        analysis.byReason['parameter-count-mismatch'].push({
          frontend: frontendCall,
          backend: bestMatch,
          details: 'Different number of parameters'
        });
        analysis.statistics.parameterCountMismatchCount++;
      } else {
        // No candidate found
        analysis.byReason['no-candidate'].push({
          route: frontendCall,
          type: 'frontend'
        });
        analysis.statistics.noCandidateCount++;
      }
    });

    // Add unmatched backend routes that have no frontend candidate
    unmatchedBackend.forEach(backendRoute => {
      let hasCandidate = false;

      // Check if this backend route was matched with any frontend call
      for (const category of ['method-mismatch', 'path-structure-mismatch', 'parameter-count-mismatch']) {
        if (analysis.byReason[category].some(item => item.backend === backendRoute)) {
          hasCandidate = true;
          break;
        }
      }

      if (!hasCandidate) {
        analysis.byReason['no-candidate'].push({
          route: backendRoute,
          type: 'backend'
        });
        analysis.statistics.noCandidateCount++;
      }
    });

    logger.info(`Analysis complete: ${analysis.statistics.methodMismatchCount} method mismatches, ` +
      `${analysis.statistics.pathStructureMismatchCount} path structure mismatches, ` +
      `${analysis.statistics.parameterCountMismatchCount} parameter count mismatches, ` +
      `${analysis.statistics.noCandidateCount} no candidates`);

    return analysis;
  }

  /**
   * Detects duplicate /api prefixes in API calls.
   * 
   * Identifies two types of issues:
   * 1. Paths containing /api/api pattern
   * 2. Paths starting with /api when base URL already includes /api
   * 
   * @param {Array<APICallInfo>} calls - List of API calls to check
   * @returns {Array<Object>} List of duplicate prefix issues, each containing:
   *   - file: Source file location
   *   - line: Line number
   *   - path: The problematic path
   *   - issue: Description of the issue
   *   - severity: 'HIGH' or 'MEDIUM'
   *   - suggestedFix: Recommended correction
   * @example
   * const issues = matcher.detectDuplicatePrefixes(frontendCalls);
   * issues.forEach(issue => {
   *   console.log(`${issue.severity}: ${issue.issue}`);
   *   console.log(`File: ${issue.file}:${issue.line}`);
   *   console.log(`Fix: Change "${issue.path}" to "${issue.suggestedFix}"`);
   * });
   */
  detectDuplicatePrefixes(calls) {
    logger.info('Detecting duplicate API prefixes');
    const issues = [];

    calls.forEach(call => {
      // Check if path contains /api/api pattern using utility
      if (hasDuplicateApiPrefix(call.path) || hasDuplicateApiPrefix(call.fullPath)) {
        issues.push({
          file: call.file,
          line: call.line,
          path: call.path,
          fullPath: call.fullPath,
          issue: 'Duplicate /api prefix detected',
          severity: 'HIGH',
          suggestedFix: fixDuplicateApiPrefix(call.path)
        });
      }

      // Check if using base URL but path already starts with /api
      if (call.hasBaseURL && call.path.startsWith('/api')) {
        issues.push({
          file: call.file,
          line: call.line,
          path: call.path,
          fullPath: call.fullPath,
          issue: 'Path starts with /api but base URL already includes /api',
          severity: 'MEDIUM',
          suggestedFix: call.path.replace(/^\/api/, '')
        });
      }
    });

    logger.info(`Found ${issues.length} duplicate prefix issues`);
    return issues;
  }
}

module.exports = RouteMatcher;
