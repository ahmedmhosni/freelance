/**
 * Backend Route Scanner
 * 
 * Scans the backend codebase to discover all registered routes.
 * Supports both modular architecture (DI container) and legacy routes.
 */

const fs = require('fs');
const path = require('path');
const { createRouteInfo } = require('../models/RouteInfo');
const logger = require('../utils/logger');

class BackendRouteScanner {
  constructor(config) {
    this.config = config;
    this.modulesPath = config.backend.modulesPath;
    this.routesPath = config.backend.routesPath;
  }

  /**
   * Scans all routes from Express app instance
   * @param {Express.Application} app - Express application instance
   * @returns {Array<RouteInfo>} List of discovered routes
   */
  scanRoutes(app) {
    logger.info('Scanning routes from Express app');
    const routes = [];

    try {
      // Extract routes from Express app's router stack
      if (app._router && app._router.stack) {
        this._extractRoutesFromStack(app._router.stack, '', routes);
      }

      logger.info(`Discovered ${routes.length} routes from Express app`);
      return routes;
    } catch (error) {
      logger.error('Error scanning routes from Express app', error);
      throw error;
    }
  }

  /**
   * Extracts routes from Express router stack
   * @private
   */
  _extractRoutesFromStack(stack, basePath, routes) {
    stack.forEach(layer => {
      if (layer.route) {
        // This is a route
        const route = layer.route;
        const methods = Object.keys(route.methods);
        
        methods.forEach(method => {
          const routePath = basePath + route.path;
          const middleware = this._extractMiddleware(layer);
          const requiresAuth = this._hasAuthMiddleware(middleware);
          
          routes.push(createRouteInfo({
            method: method.toUpperCase(),
            path: routePath,
            handler: this._getHandlerName(route.stack),
            middleware: middleware,
            module: this._extractModuleName(routePath),
            isLegacy: this._isLegacyRoute(routePath),
            requiresAuth: requiresAuth,
            file: this._getRouteFile(layer)
          }));
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // This is a nested router
        const routerPath = layer.regexp ? this._extractPathFromRegex(layer.regexp) : '';
        this._extractRoutesFromStack(layer.handle.stack, basePath + routerPath, routes);
      }
    });
  }

  /**
   * Scans modular architecture routes from DI container
   * @param {Container} container - DI container instance
   * @returns {Array<RouteInfo>} List of module routes
   */
  scanModuleRoutes(container) {
    logger.info('Scanning modular architecture routes');
    const routes = [];

    try {
      const modules = this._getModuleList();
      
      // Map of module directory names to controller names (for special cases)
      const controllerNameMap = {
        'time-tracking': 'timeEntryController',
        'tasks': 'taskController',           // Singular, not plural
        'clients': 'clientController',       // Singular, not plural
        'projects': 'projectController',     // Singular, not plural
        'invoices': 'invoiceController',     // Singular, not plural
        'notifications': 'notificationController'  // Singular, not plural
      };
      
      modules.forEach(moduleName => {
        try {
          // Get controller name (handle special cases)
          const controllerName = controllerNameMap[moduleName] || `${moduleName}Controller`;
          
          // Try to resolve controller from container
          if (container && container.has && container.has(controllerName)) {
            const controller = container.resolve(controllerName);
            
            if (controller.router) {
              const moduleRoutes = this._extractRoutesFromRouter(
                controller.router,
                `/api/${moduleName}`,
                moduleName
              );
              routes.push(...moduleRoutes);
              logger.debug(`Found ${moduleRoutes.length} routes in ${moduleName} module`);
            }
          } else {
            logger.debug(`Controller ${controllerName} not found in container for module ${moduleName}`);
          }
        } catch (error) {
          logger.warn(`Could not scan module ${moduleName}:`, error.message);
        }
      });

      logger.info(`Discovered ${routes.length} routes from modular architecture`);
      return routes;
    } catch (error) {
      logger.error('Error scanning modular routes', error);
      throw error;
    }
  }

  /**
   * Scans legacy routes from routes/ directory
   * @returns {Array<RouteInfo>} List of legacy routes
   */
  scanLegacyRoutes() {
    logger.info('Scanning legacy routes');
    const routes = [];

    try {
      if (!fs.existsSync(this.routesPath)) {
        logger.warn(`Routes path does not exist: ${this.routesPath}`);
        return routes;
      }

      const routeFiles = fs.readdirSync(this.routesPath)
        .filter(file => file.endsWith('.js'));

      routeFiles.forEach(file => {
        const routeName = path.basename(file, '.js');
        const filePath = path.join(this.routesPath, file);
        
        try {
          // Require the route file to analyze it
          delete require.cache[require.resolve(filePath)];
          const router = require(filePath);
          
          if (router && router.stack) {
            const basePath = `/api/${routeName}`;
            const legacyRoutes = this._extractRoutesFromRouter(router, basePath, null, true);
            
            // Mark all as legacy and set file path
            legacyRoutes.forEach(route => {
              route.isLegacy = true;
              route.file = filePath;
            });
            
            routes.push(...legacyRoutes);
            logger.debug(`Found ${legacyRoutes.length} routes in legacy file ${file}`);
          }
        } catch (error) {
          logger.warn(`Could not scan legacy route file ${file}:`, error.message);
        }
      });

      logger.info(`Discovered ${routes.length} legacy routes`);
      return routes;
    } catch (error) {
      logger.error('Error scanning legacy routes', error);
      throw error;
    }
  }

  /**
   * Extracts routes from an Express router
   * @private
   */
  _extractRoutesFromRouter(router, basePath, moduleName, isLegacy = false) {
    const routes = [];

    if (!router || !router.stack) {
      return routes;
    }

    router.stack.forEach(layer => {
      if (layer.route) {
        const route = layer.route;
        const methods = Object.keys(route.methods);
        
        methods.forEach(method => {
          const routePath = basePath + route.path;
          const middleware = this._extractMiddleware(layer);
          const requiresAuth = this._hasAuthMiddleware(middleware);
          
          routes.push(createRouteInfo({
            method: method.toUpperCase(),
            path: routePath,
            handler: this._getHandlerName(route.stack),
            middleware: middleware,
            module: moduleName,
            isLegacy: isLegacy,
            requiresAuth: requiresAuth,
            file: 'unknown'
          }));
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Nested router
        const nestedRoutes = this._extractRoutesFromRouter(
          layer.handle,
          basePath,
          moduleName,
          isLegacy
        );
        routes.push(...nestedRoutes);
      }
    });

    return routes;
  }

  /**
   * Gets list of module names from modules directory
   * @private
   */
  _getModuleList() {
    try {
      if (!fs.existsSync(this.modulesPath)) {
        logger.warn(`Modules path does not exist: ${this.modulesPath}`);
        return [];
      }

      return fs.readdirSync(this.modulesPath)
        .filter(item => {
          const itemPath = path.join(this.modulesPath, item);
          return fs.statSync(itemPath).isDirectory() && item !== '.gitkeep';
        });
    } catch (error) {
      logger.error('Error getting module list', error);
      return [];
    }
  }

  /**
   * Extracts middleware names from layer
   * @private
   */
  _extractMiddleware(layer) {
    const middleware = [];
    
    if (layer.route && layer.route.stack) {
      layer.route.stack.forEach(handler => {
        if (handler.name && handler.name !== '<anonymous>' && handler.name !== 'bound dispatch') {
          middleware.push(handler.name);
        }
      });
    }
    
    return middleware;
  }

  /**
   * Checks if middleware includes authentication
   * @private
   */
  _hasAuthMiddleware(middleware) {
    const authMiddlewareNames = [
      'authenticateToken',
      'authenticate',
      'authMiddleware',
      'requireAuth',
      'verifyToken'
    ];
    
    return middleware.some(mw => 
      authMiddlewareNames.some(authName => 
        mw.toLowerCase().includes(authName.toLowerCase())
      )
    );
  }

  /**
   * Gets handler function name from route stack
   * @private
   */
  _getHandlerName(stack) {
    if (!stack || stack.length === 0) {
      return 'unknown';
    }
    
    // Get the last handler (usually the actual route handler)
    const handler = stack[stack.length - 1];
    return handler.name || handler.handle?.name || 'anonymous';
  }

  /**
   * Extracts module name from route path
   * @private
   */
  _extractModuleName(routePath) {
    // Extract module name from path like /api/clients -> clients
    const match = routePath.match(/^\/api\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Determines if route is from legacy architecture
   * @private
   */
  _isLegacyRoute(routePath) {
    const legacyRoutes = [
      'dashboard', 'quotes', 'maintenance', 'status', 'profile',
      'user', 'legal', 'files', 'feedback', 'preferences',
      'gdpr', 'version', 'changelog', 'announcements', 'health'
    ];
    
    const moduleName = this._extractModuleName(routePath);
    return moduleName ? legacyRoutes.includes(moduleName) : false;
  }

  /**
   * Gets source file for route
   * @private
   */
  _getRouteFile(layer) {
    // Try to extract file information from stack trace
    try {
      const stack = new Error().stack;
      const lines = stack.split('\n');
      for (const line of lines) {
        if (line.includes('backend') && line.includes('.js')) {
          const match = line.match(/\((.+\.js):\d+:\d+\)/);
          if (match) {
            return match[1];
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return 'unknown';
  }

  /**
   * Extracts path from Express regex
   * @private
   */
  _extractPathFromRegex(regex) {
    const regexStr = regex.toString();
    
    // Try to extract path from regex string
    // Express uses patterns like /^\/api\/clients\/?(?=\/|$)/i
    const match = regexStr.match(/\^\\\/([^\\?]+)/);
    if (match) {
      return '/' + match[1].replace(/\\\//g, '/');
    }
    
    return '';
  }

  /**
   * Detects duplicate routes
   * @param {Array<RouteInfo>} routes - List of routes to check
   * @returns {Array<Object>} List of duplicate route conflicts
   */
  detectDuplicates(routes) {
    logger.info('Detecting duplicate routes');
    const duplicates = [];
    const routeMap = new Map();

    routes.forEach(route => {
      const key = `${route.method}:${route.path}`;
      
      if (routeMap.has(key)) {
        const existing = routeMap.get(key);
        duplicates.push({
          method: route.method,
          path: route.path,
          routes: [existing, route],
          severity: 'HIGH',
          message: `Duplicate route detected: ${route.method} ${route.path}`
        });
      } else {
        routeMap.set(key, route);
      }
    });

    logger.info(`Found ${duplicates.length} duplicate routes`);
    return duplicates;
  }

  /**
   * Analyzes middleware for all routes
   * @param {Array<RouteInfo>} routes - List of routes to analyze
   * @returns {Object} Middleware analysis results
   */
  analyzeMiddleware(routes) {
    logger.info('Analyzing middleware');
    
    const analysis = {
      routesWithAuth: 0,
      routesWithoutAuth: 0,
      middlewareUsage: {},
      missingAuthRoutes: [],
      middlewareOrderIssues: []
    };

    routes.forEach(route => {
      // Count auth middleware
      if (route.requiresAuth) {
        analysis.routesWithAuth++;
      } else {
        analysis.routesWithoutAuth++;
        
        // Check if this route should have auth (not public routes)
        if (!this._isPublicRoute(route.path)) {
          analysis.missingAuthRoutes.push(route);
        }
      }

      // Track middleware usage
      route.middleware.forEach(mw => {
        analysis.middlewareUsage[mw] = (analysis.middlewareUsage[mw] || 0) + 1;
      });

      // Check middleware order
      const orderIssue = this._checkMiddlewareOrder(route);
      if (orderIssue) {
        analysis.middlewareOrderIssues.push(orderIssue);
      }
    });

    logger.info(`Middleware analysis complete: ${analysis.routesWithAuth} with auth, ${analysis.routesWithoutAuth} without auth`);
    return analysis;
  }

  /**
   * Checks if route is a public route (doesn't need auth)
   * @private
   */
  _isPublicRoute(path) {
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/health',
      '/api/status',
      '/api/maintenance',
      '/api/changelog',
      '/api/announcements'
    ];
    
    return publicPaths.some(publicPath => path.startsWith(publicPath));
  }

  /**
   * Checks middleware execution order
   * @private
   */
  _checkMiddlewareOrder(route) {
    // Authentication middleware should come before other middleware
    const authIndex = route.middleware.findIndex(mw => 
      this._hasAuthMiddleware([mw])
    );
    
    if (authIndex > 0) {
      return {
        route: route,
        issue: 'Authentication middleware is not first in chain',
        middleware: route.middleware,
        severity: 'MEDIUM'
      };
    }
    
    return null;
  }
}

module.exports = BackendRouteScanner;
