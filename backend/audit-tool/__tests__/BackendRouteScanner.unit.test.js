/**
 * Unit Tests for BackendRouteScanner
 * 
 * Tests route extraction, module scanning, legacy route scanning, and duplicate detection.
 * Requirements: 1.1, 1.3, 1.4
 */

const BackendRouteScanner = require('../scanners/BackendRouteScanner');
const { createRouteInfo } = require('../models/RouteInfo');

describe('BackendRouteScanner', () => {
  let scanner;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      backend: {
        modulesPath: './backend/src/modules',
        routesPath: './backend/src/routes'
      }
    };
    scanner = new BackendRouteScanner(mockConfig);
  });

  describe('scanRoutes - Route extraction from Express app', () => {
    it('should extract routes from Express app router stack', () => {
      // Mock Express app with router stack
      const mockApp = {
        _router: {
          stack: [
            {
              route: {
                path: '/clients',
                methods: { get: true },
                stack: [{ name: 'getClients' }]
              }
            },
            {
              route: {
                path: '/clients/:id',
                methods: { get: true, put: true },
                stack: [{ name: 'getClient' }]
              }
            }
          ]
        }
      };

      const routes = scanner.scanRoutes(mockApp);

      expect(routes).toHaveLength(3); // GET /clients, GET /clients/:id, PUT /clients/:id
      expect(routes[0].method).toBe('GET');
      expect(routes[0].path).toBe('/clients');
      expect(routes[1].method).toBe('GET');
      expect(routes[1].path).toBe('/clients/:id');
      expect(routes[2].method).toBe('PUT');
      expect(routes[2].path).toBe('/clients/:id');
    });

    it('should handle nested routers', () => {
      const mockApp = {
        _router: {
          stack: [
            {
              name: 'router',
              regexp: /^\/api\/?(?=\/|$)/i,
              handle: {
                stack: [
                  {
                    route: {
                      path: '/clients',
                      methods: { get: true },
                      stack: [{ name: 'getClients' }]
                    }
                  }
                ]
              }
            }
          ]
        }
      };

      const routes = scanner.scanRoutes(mockApp);

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toContain('/clients');
    });

    it('should extract middleware from routes', () => {
      const mockApp = {
        _router: {
          stack: [
            {
              route: {
                path: '/protected',
                methods: { get: true },
                stack: [
                  { name: 'authenticateToken' },
                  { name: 'getProtected' }
                ]
              }
            }
          ]
        }
      };

      const routes = scanner.scanRoutes(mockApp);

      expect(routes[0].middleware).toContain('authenticateToken');
      expect(routes[0].requiresAuth).toBe(true);
    });

    it('should handle empty router stack', () => {
      const mockApp = {
        _router: {
          stack: []
        }
      };

      const routes = scanner.scanRoutes(mockApp);

      expect(routes).toHaveLength(0);
    });

    it('should throw error when app has no router', () => {
      const mockApp = {};

      const routes = scanner.scanRoutes(mockApp);

      expect(routes).toHaveLength(0);
    });
  });

  describe('scanModuleRoutes - Module route scanning', () => {
    it('should scan routes from DI container modules', () => {
      const mockRouter = {
        stack: [
          {
            route: {
              path: '/',
              methods: { get: true },
              stack: [{ name: 'getAll' }]
            }
          },
          {
            route: {
              path: '/:id',
              methods: { get: true },
              stack: [{ name: 'getById' }]
            }
          }
        ]
      };

      const mockController = {
        router: mockRouter
      };

      const mockContainer = {
        has: jest.fn((name) => name === 'clientsController'),
        resolve: jest.fn(() => mockController)
      };

      // Mock _getModuleList to return test modules
      scanner._getModuleList = jest.fn(() => ['clients']);

      const routes = scanner.scanModuleRoutes(mockContainer);

      expect(routes).toHaveLength(2);
      expect(routes[0].path).toBe('/api/clients/');
      expect(routes[0].module).toBe('clients');
      expect(routes[0].isLegacy).toBe(false);
    });

    it('should handle modules without controllers', () => {
      const mockContainer = {
        has: jest.fn(() => false),
        resolve: jest.fn()
      };

      scanner._getModuleList = jest.fn(() => ['nonexistent']);

      const routes = scanner.scanModuleRoutes(mockContainer);

      expect(routes).toHaveLength(0);
    });

    it('should handle container errors gracefully', () => {
      const mockContainer = {
        has: jest.fn(() => true),
        resolve: jest.fn(() => {
          throw new Error('Container error');
        })
      };

      scanner._getModuleList = jest.fn(() => ['clients']);

      const routes = scanner.scanModuleRoutes(mockContainer);

      expect(routes).toHaveLength(0);
    });
  });

  describe('scanLegacyRoutes - Legacy route scanning', () => {
    it('should identify legacy routes correctly', () => {
      const route = createRouteInfo({
        method: 'GET',
        path: '/api/dashboard',
        handler: 'getDashboard',
        middleware: [],
        module: 'dashboard',
        isLegacy: false,
        requiresAuth: false,
        file: 'unknown'
      });

      const isLegacy = scanner._isLegacyRoute(route.path);

      expect(isLegacy).toBe(true);
    });

    it('should identify modular routes correctly', () => {
      const route = createRouteInfo({
        method: 'GET',
        path: '/api/clients',
        handler: 'getClients',
        middleware: [],
        module: 'clients',
        isLegacy: false,
        requiresAuth: false,
        file: 'unknown'
      });

      const isLegacy = scanner._isLegacyRoute(route.path);

      expect(isLegacy).toBe(false);
    });
  });

  describe('detectDuplicates - Duplicate detection', () => {
    it('should detect duplicate routes with same method and path', () => {
      const routes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients1',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        }),
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients2',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file2.js'
        })
      ];

      const duplicates = scanner.detectDuplicates(routes);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].method).toBe('GET');
      expect(duplicates[0].path).toBe('/api/clients');
      expect(duplicates[0].routes).toHaveLength(2);
      expect(duplicates[0].severity).toBe('HIGH');
    });

    it('should not flag routes with different methods as duplicates', () => {
      const routes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        }),
        createRouteInfo({
          method: 'POST',
          path: '/api/clients',
          handler: 'createClient',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        })
      ];

      const duplicates = scanner.detectDuplicates(routes);

      expect(duplicates).toHaveLength(0);
    });

    it('should not flag routes with different paths as duplicates', () => {
      const routes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        }),
        createRouteInfo({
          method: 'GET',
          path: '/api/clients/:id',
          handler: 'getClient',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        })
      ];

      const duplicates = scanner.detectDuplicates(routes);

      expect(duplicates).toHaveLength(0);
    });

    it('should handle empty route list', () => {
      const duplicates = scanner.detectDuplicates([]);

      expect(duplicates).toHaveLength(0);
    });

    it('should detect multiple duplicate groups', () => {
      const routes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients1',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        }),
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients2',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file2.js'
        }),
        createRouteInfo({
          method: 'POST',
          path: '/api/projects',
          handler: 'createProject1',
          middleware: [],
          module: 'projects',
          isLegacy: false,
          requiresAuth: false,
          file: 'file3.js'
        }),
        createRouteInfo({
          method: 'POST',
          path: '/api/projects',
          handler: 'createProject2',
          middleware: [],
          module: 'projects',
          isLegacy: false,
          requiresAuth: false,
          file: 'file4.js'
        })
      ];

      const duplicates = scanner.detectDuplicates(routes);

      expect(duplicates).toHaveLength(2);
    });
  });

  describe('analyzeMiddleware - Middleware analysis', () => {
    it('should count routes with and without auth', () => {
      const routes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: ['authenticateToken'],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'file1.js'
        }),
        createRouteInfo({
          method: 'POST',
          path: '/api/auth/login',
          handler: 'login',
          middleware: [],
          module: 'auth',
          isLegacy: false,
          requiresAuth: false,
          file: 'file2.js'
        })
      ];

      const analysis = scanner.analyzeMiddleware(routes);

      expect(analysis.routesWithAuth).toBe(1);
      expect(analysis.routesWithoutAuth).toBe(1);
    });

    it('should track middleware usage', () => {
      const routes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: ['authenticateToken', 'validateRequest'],
          module: 'clients',
          isLegacy: false,
          requiresAuth: true,
          file: 'file1.js'
        }),
        createRouteInfo({
          method: 'GET',
          path: '/api/projects',
          handler: 'getProjects',
          middleware: ['authenticateToken'],
          module: 'projects',
          isLegacy: false,
          requiresAuth: true,
          file: 'file2.js'
        })
      ];

      const analysis = scanner.analyzeMiddleware(routes);

      expect(analysis.middlewareUsage['authenticateToken']).toBe(2);
      expect(analysis.middlewareUsage['validateRequest']).toBe(1);
    });

    it('should identify routes missing auth middleware', () => {
      const routes = [
        createRouteInfo({
          method: 'GET',
          path: '/api/clients',
          handler: 'getClients',
          middleware: [],
          module: 'clients',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        })
      ];

      const analysis = scanner.analyzeMiddleware(routes);

      expect(analysis.missingAuthRoutes).toHaveLength(1);
      expect(analysis.missingAuthRoutes[0].path).toBe('/api/clients');
    });

    it('should not flag public routes as missing auth', () => {
      const routes = [
        createRouteInfo({
          method: 'POST',
          path: '/api/auth/login',
          handler: 'login',
          middleware: [],
          module: 'auth',
          isLegacy: false,
          requiresAuth: false,
          file: 'file1.js'
        }),
        createRouteInfo({
          method: 'GET',
          path: '/api/health',
          handler: 'health',
          middleware: [],
          module: 'health',
          isLegacy: false,
          requiresAuth: false,
          file: 'file2.js'
        })
      ];

      const analysis = scanner.analyzeMiddleware(routes);

      expect(analysis.missingAuthRoutes).toHaveLength(0);
    });
  });

  describe('Helper methods', () => {
    it('should extract module name from path', () => {
      const moduleName = scanner._extractModuleName('/api/clients/123');
      expect(moduleName).toBe('clients');
    });

    it('should return null for paths without module', () => {
      const moduleName = scanner._extractModuleName('/health');
      expect(moduleName).toBeNull();
    });

    it('should detect auth middleware', () => {
      const hasAuth = scanner._hasAuthMiddleware(['authenticateToken', 'validateRequest']);
      expect(hasAuth).toBe(true);
    });

    it('should return false when no auth middleware present', () => {
      const hasAuth = scanner._hasAuthMiddleware(['validateRequest', 'logRequest']);
      expect(hasAuth).toBe(false);
    });

    it('should identify public routes', () => {
      expect(scanner._isPublicRoute('/api/auth/login')).toBe(true);
      expect(scanner._isPublicRoute('/api/auth/register')).toBe(true);
      expect(scanner._isPublicRoute('/api/health')).toBe(true);
      expect(scanner._isPublicRoute('/api/clients')).toBe(false);
    });
  });
});
