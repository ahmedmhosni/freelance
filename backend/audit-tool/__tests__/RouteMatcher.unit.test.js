/**
 * Unit Tests for RouteMatcher
 * 
 * Tests path matching algorithm, path normalization, and parameter matching.
 * Requirements: 2.1, 2.4
 */

const RouteMatcher = require('../matchers/RouteMatcher');
const { createAPICallInfo } = require('../models/APICallInfo');
const { createRouteInfo } = require('../models/RouteInfo');
const {
  normalizePath,
  pathsMatch,
  isParameter,
  hasDuplicateApiPrefix,
  fixDuplicateApiPrefix,
  removeApiPrefix,
  addApiPrefix,
  getPathSegments
} = require('../utils/pathNormalizer');

describe('RouteMatcher', () => {
  let matcher;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {};
    matcher = new RouteMatcher(mockConfig);
  });

  describe('matchRoutes - Path matching algorithm', () => {
    it('should match frontend call to backend route with exact path', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients'
        })
      ];

      const backendRoutes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'ClientController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(1);
      expect(result.matched[0].frontend.path).toBe('/clients');
      expect(result.matched[0].backend.path).toBe('/api/clients');
      expect(result.unmatchedFrontend).toHaveLength(0);
      expect(result.unmatchedBackend).toHaveLength(0);
    });

    it('should match routes with path parameters', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 15,
          method: 'get',
          path: '/clients/:id',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients/:id'
        })
      ];

      const backendRoutes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients/:id',
          handler: 'getClient',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'ClientController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(1);
      expect(result.unmatchedFrontend).toHaveLength(0);
      expect(result.unmatchedBackend).toHaveLength(0);
    });

    it('should match routes with different parameter names', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 15,
          method: 'get',
          path: '/clients/:clientId',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients/:clientId'
        })
      ];

      const backendRoutes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients/:id',
          handler: 'getClient',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'ClientController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(1);
    });

    it('should not match routes with different HTTP methods', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients'
        })
      ];

      const backendRoutes = [
        createRouteInfo({
          method: 'POST',
          path: '/api/clients',
          handler: 'createClient',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'ClientController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(0);
      expect(result.unmatchedFrontend).toHaveLength(1);
      expect(result.unmatchedBackend).toHaveLength(1);
    });

    it('should not match routes with different paths', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients'
        })
      ];

      const backendRoutes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/projects',
          handler: 'getProjects',
          middleware: [],
          module: 'projects',
          isLegacy: false,
          requiresAuth: true,
          file: 'ProjectController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(0);
      expect(result.unmatchedFrontend).toHaveLength(1);
      expect(result.unmatchedBackend).toHaveLength(1);
    });

    it('should match multiple routes correctly', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients'
        }),
        createAPICallInfo({
          file: 'Projects.jsx',
          line: 15,
          method: 'get',
          path: '/projects',
          component: 'Projects',
          hasBaseURL: true,
          fullPath: '/api/projects'
        }),
        createAPICallInfo({
          file: 'Tasks.jsx',
          line: 20,
          method: 'post',
          path: '/tasks',
          component: 'Tasks',
          hasBaseURL: true,
          fullPath: '/api/tasks'
        })
      ];

      const backendRoutes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'ClientController.js'
        }),
        createRouteInfo({
          method: 'GET',
          path: '/api/projects',
          handler: 'getProjects',
          middleware: [],
          module: 'projects',
          isLegacy: false,
          requiresAuth: true,
          file: 'ProjectController.js'
        }),
        createRouteInfo({
          method: 'POST',
          path: '/api/tasks',
          handler: 'createTask',
          middleware: [],
          module: 'tasks',
          isLegacy: false,
          requiresAuth: true,
          file: 'TaskController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(3);
      expect(result.unmatchedFrontend).toHaveLength(0);
      expect(result.unmatchedBackend).toHaveLength(0);
    });

    it('should handle empty frontend calls', () => {
      const frontendCalls = [];
      const backendRoutes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'ClientController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(0);
      expect(result.unmatchedFrontend).toHaveLength(0);
      expect(result.unmatchedBackend).toHaveLength(1);
    });

    it('should handle empty backend routes', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients'
        })
      ];
      const backendRoutes = [];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(0);
      expect(result.unmatchedFrontend).toHaveLength(1);
      expect(result.unmatchedBackend).toHaveLength(0);
    });

    it('should match case-insensitively for HTTP methods', () => {
      const frontendCalls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients'
        })
      ];

      const backendRoutes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'ClientController.js'
        })
      ];

      const result = matcher.matchRoutes(frontendCalls, backendRoutes);

      expect(result.matched).toHaveLength(1);
    });
  });

  describe('Path normalization utilities', () => {
    it('should normalize paths correctly', () => {
      expect(normalizePath('/clients')).toBe('/clients');
      expect(normalizePath('/api/clients')).toBe('/api/clients');
      expect(normalizePath('clients')).toBe('/clients');
      expect(normalizePath('/api/clients/')).toBe('/api/clients');
      expect(normalizePath('/api//clients')).toBe('/api/clients');
    });

    it('should handle empty or invalid paths', () => {
      expect(normalizePath('')).toBe('');
      expect(normalizePath(null)).toBe('');
      expect(normalizePath(undefined)).toBe('');
    });

    it('should remove API prefix', () => {
      expect(removeApiPrefix('/api/clients')).toBe('/clients');
      expect(removeApiPrefix('/api')).toBe('/');
      expect(removeApiPrefix('/clients')).toBe('/clients');
    });

    it('should add API prefix', () => {
      expect(addApiPrefix('/clients')).toBe('/api/clients');
      expect(addApiPrefix('clients')).toBe('/api/clients');
      expect(addApiPrefix('/api/clients')).toBe('/api/clients');
    });

    it('should get path segments', () => {
      expect(getPathSegments('/api/clients')).toEqual(['api', 'clients']);
      expect(getPathSegments('/api/clients/:id')).toEqual(['api', 'clients', ':id']);
      expect(getPathSegments('/')).toEqual([]);
    });
  });

  describe('Parameter matching', () => {
    it('should identify Express-style parameters', () => {
      expect(isParameter(':id')).toBe(true);
      expect(isParameter(':userId')).toBe(true);
      expect(isParameter(':clientId')).toBe(true);
    });

    it('should identify numeric IDs as parameters', () => {
      expect(isParameter('123')).toBe(true);
      expect(isParameter('456789')).toBe(true);
    });

    it('should identify UUIDs as parameters', () => {
      expect(isParameter('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should identify MongoDB ObjectIds as parameters', () => {
      expect(isParameter('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('should not identify regular strings as parameters', () => {
      expect(isParameter('clients')).toBe(false);
      expect(isParameter('projects')).toBe(false);
      expect(isParameter('api')).toBe(false);
    });

    it('should match paths with parameters', () => {
      expect(pathsMatch('/api/clients/:id', '/api/clients/123')).toBe(true);
      expect(pathsMatch('/api/clients/123', '/api/clients/:id')).toBe(true);
      expect(pathsMatch('/api/clients/:clientId', '/api/clients/:id')).toBe(true);
    });

    it('should not match paths with different segment counts', () => {
      expect(pathsMatch('/api/clients', '/api/clients/:id')).toBe(false);
      expect(pathsMatch('/api/clients/:id/projects', '/api/clients/:id')).toBe(false);
    });

    it('should not match paths with different non-parameter segments', () => {
      expect(pathsMatch('/api/clients/:id', '/api/projects/:id')).toBe(false);
    });
  });

  describe('Duplicate prefix detection', () => {
    it('should detect /api/api pattern', () => {
      expect(hasDuplicateApiPrefix('/api/api/clients')).toBe(true);
      expect(hasDuplicateApiPrefix('/api/clients')).toBe(false);
    });

    it('should fix duplicate API prefixes', () => {
      expect(fixDuplicateApiPrefix('/api/api/clients')).toBe('/api/clients');
      expect(fixDuplicateApiPrefix('/api/api/api/clients')).toBe('/api/clients');
      expect(fixDuplicateApiPrefix('/api/clients')).toBe('/api/clients');
    });

    it('should detect duplicate prefixes in API calls', () => {
      const calls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/api/api/clients',
          component: 'Clients',
          hasBaseURL: false,
          fullPath: '/api/api/clients'
        })
      ];

      const issues = matcher.detectDuplicatePrefixes(calls);

      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('HIGH');
      expect(issues[0].suggestedFix).toBe('/api/clients');
    });

    it('should detect path with /api when using base URL', () => {
      const calls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/api/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/api/clients'
        })
      ];

      const issues = matcher.detectDuplicatePrefixes(calls);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.severity === 'MEDIUM')).toBe(true);
    });
  });
});
