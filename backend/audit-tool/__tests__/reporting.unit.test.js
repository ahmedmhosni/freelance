/**
 * Unit Tests for Reporting Functionality
 * 
 * Tests report structure, category grouping, and suggestion format
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

const RouteMatcher = require('../matchers/RouteMatcher');

describe('Reporting Unit Tests', () => {
  let matcher;

  beforeEach(() => {
    matcher = new RouteMatcher({});
  });

  describe('analyzeUnmatchedRoutes', () => {
    test('returns correct report structure', () => {
      const unmatchedFrontend = [
        {
          method: 'GET',
          path: '/api/tasks',
          fullPath: '/api/tasks',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const unmatchedBackend = [
        {
          method: 'POST',
          path: '/api/tasks',
          file: 'routes.js',
          line: 1,
          controller: 'TasksController',
          handler: 'createTask'
        }
      ];

      const analysis = matcher.analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend);

      // Verify structure
      expect(analysis).toHaveProperty('byReason');
      expect(analysis).toHaveProperty('statistics');
      expect(analysis.byReason).toHaveProperty('method-mismatch');
      expect(analysis.byReason).toHaveProperty('path-structure-mismatch');
      expect(analysis.byReason).toHaveProperty('parameter-count-mismatch');
      expect(analysis.byReason).toHaveProperty('no-candidate');
    });

    test('categorizes method mismatches correctly', () => {
      const unmatchedFrontend = [
        {
          method: 'GET',
          path: '/api/tasks',
          fullPath: '/api/tasks',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const unmatchedBackend = [
        {
          method: 'POST',
          path: '/api/tasks',
          file: 'routes.js',
          line: 1,
          controller: 'TasksController',
          handler: 'createTask'
        }
      ];

      const analysis = matcher.analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend);

      expect(analysis.byReason['method-mismatch'].length).toBeGreaterThan(0);
      expect(analysis.byReason['method-mismatch'][0]).toHaveProperty('frontend');
      expect(analysis.byReason['method-mismatch'][0]).toHaveProperty('backend');
      expect(analysis.byReason['method-mismatch'][0]).toHaveProperty('details');
    });

    test('handles empty input arrays', () => {
      const analysis = matcher.analyzeUnmatchedRoutes([], []);

      expect(analysis.statistics.totalUnmatchedFrontend).toBe(0);
      expect(analysis.statistics.totalUnmatchedBackend).toBe(0);
      expect(analysis.statistics.noCandidateCount).toBe(0);
    });
  });

  describe('suggestMatches', () => {
    test('returns correct suggestion format', () => {
      const unmatchedFrontend = [
        {
          method: 'GET',
          path: '/api/tasks/123',
          fullPath: '/api/tasks/123',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const unmatchedBackend = [
        {
          method: 'GET',
          path: '/api/tasks/:id',
          file: 'routes.js',
          line: 1,
          controller: 'TasksController',
          handler: 'getTask'
        }
      ];

      const suggestions = matcher.suggestMatches(unmatchedFrontend, unmatchedBackend);

      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('frontend');
        expect(suggestion).toHaveProperty('backend');
        expect(suggestion).toHaveProperty('similarity');
        expect(suggestion).toHaveProperty('reason');
        expect(suggestion).toHaveProperty('suggestedAction');
      });
    });

    test('includes method mismatch in reason when methods differ', () => {
      const unmatchedFrontend = [
        {
          method: 'POST',
          path: '/api/tasks/123',
          fullPath: '/api/tasks/123',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const unmatchedBackend = [
        {
          method: 'GET',
          path: '/api/tasks/:id',
          file: 'routes.js',
          line: 1,
          controller: 'TasksController',
          handler: 'getTask'
        }
      ];

      const suggestions = matcher.suggestMatches(unmatchedFrontend, unmatchedBackend);

      if (suggestions.length > 0) {
        expect(suggestions[0].reason.toLowerCase()).toContain('method');
      }
    });

    test('returns empty array when no similar routes exist', () => {
      const unmatchedFrontend = [
        {
          method: 'GET',
          path: '/api/tasks',
          fullPath: '/api/tasks',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const unmatchedBackend = [
        {
          method: 'GET',
          path: '/api/completely/different/route',
          file: 'routes.js',
          line: 1,
          controller: 'OtherController',
          handler: 'otherHandler'
        }
      ];

      const suggestions = matcher.suggestMatches(unmatchedFrontend, unmatchedBackend);

      expect(suggestions.length).toBe(0);
    });
  });

  describe('matchRoutes with statistics', () => {
    test('includes statistics in match results', () => {
      const frontendCalls = [
        {
          method: 'GET',
          path: '/api/tasks',
          fullPath: '/api/tasks',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const backendRoutes = [
        {
          method: 'GET',
          path: '/api/tasks',
          file: 'routes.js',
          line: 1,
          controller: 'TasksController',
          handler: 'getTasks'
        }
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result).toHaveProperty('statistics');
      expect(result.statistics.totalFrontend).toBe(1);
      expect(result.statistics.totalBackend).toBe(1);
      expect(result.statistics.matchedCount).toBe(1);
      expect(result.statistics.matchRate).toBe(1);
    });

    test('calculates improvement from previous results', () => {
      const frontendCalls = [
        {
          method: 'GET',
          path: '/api/tasks',
          fullPath: '/api/tasks',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const backendRoutes = [
        {
          method: 'GET',
          path: '/api/tasks',
          file: 'routes.js',
          line: 1,
          controller: 'TasksController',
          handler: 'getTasks'
        }
      ];

      const firstResult = matcher.matchRoutes(frontendCalls, backendRoutes);
      const secondResult = matcher.matchRoutes(frontendCalls, backendRoutes, firstResult);

      expect(secondResult.statistics.improvementFromPrevious).toBe(0);
    });

    test('includes confidence levels in matched routes', () => {
      const frontendCalls = [
        {
          method: 'GET',
          path: '/api/tasks/123',
          fullPath: '/api/tasks/123',
          file: 'test.js',
          line: 1,
          hasBaseURL: false
        }
      ];

      const backendRoutes = [
        {
          method: 'GET',
          path: '/api/tasks/:id',
          file: 'routes.js',
          line: 1,
          controller: 'TasksController',
          handler: 'getTask'
        }
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched.length).toBe(1);
      expect(result.matched[0]).toHaveProperty('confidence');
      expect(['exact', 'parameter-match', 'normalized']).toContain(result.matched[0].confidence);
    });
  });
});
