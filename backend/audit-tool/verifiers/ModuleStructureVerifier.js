const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Module Structure Verifier
 * Verifies that all modules follow consistent structure and patterns
 */
class ModuleStructureVerifier {
  constructor(config = {}) {
    this.modulesPath = config.modulesPath || path.join(__dirname, '../../src/modules');
    this.baseControllerPath = config.baseControllerPath || path.join(__dirname, '../../src/shared/base/BaseController.js');
    
    // Required directories for each module
    this.requiredDirectories = ['controllers', 'services'];
    
    // Optional directories (not all modules need these)
    this.optionalDirectories = ['repositories', 'models', 'dto', 'validators'];
    
    // Required files
    this.requiredFiles = ['index.js'];
  }

  /**
   * Verify all modules have consistent structure
   * @returns {Promise<Object>} Verification results
   */
  async verifyAllModules() {
    try {
      logger.info('Starting module structure verification');
      
      const modules = await this.discoverModules();
      const results = {
        totalModules: modules.length,
        passedModules: 0,
        failedModules: 0,
        modules: [],
        issues: []
      };

      for (const moduleName of modules) {
        const moduleResult = await this.verifyModule(moduleName);
        results.modules.push(moduleResult);
        
        if (moduleResult.passed) {
          results.passedModules++;
        } else {
          results.failedModules++;
          results.issues.push(...moduleResult.issues);
        }
      }

      logger.info('Module structure verification complete', {
        total: results.totalModules,
        passed: results.passedModules,
        failed: results.failedModules
      });

      return results;
    } catch (error) {
      logger.error('Error verifying module structure', { error: error.message });
      throw error;
    }
  }

  /**
   * Discover all modules in the modules directory
   * @returns {Promise<Array<string>>} List of module names
   */
  async discoverModules() {
    try {
      const entries = await fs.readdir(this.modulesPath, { withFileTypes: true });
      const modules = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(name => !name.startsWith('.'));
      
      logger.info(`Discovered ${modules.length} modules`, { modules });
      return modules;
    } catch (error) {
      logger.error('Error discovering modules', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify a single module's structure
   * @param {string} moduleName - Name of the module to verify
   * @returns {Promise<Object>} Verification result for the module
   */
  async verifyModule(moduleName) {
    const modulePath = path.join(this.modulesPath, moduleName);
    const result = {
      moduleName,
      passed: true,
      issues: [],
      structure: {
        directories: {},
        files: {}
      }
    };

    try {
      // Check required directories
      for (const dir of this.requiredDirectories) {
        const dirPath = path.join(modulePath, dir);
        const exists = await this.pathExists(dirPath);
        result.structure.directories[dir] = exists;
        
        if (!exists) {
          result.passed = false;
          result.issues.push({
            type: 'MISSING_DIRECTORY',
            severity: 'HIGH',
            message: `Required directory '${dir}' is missing`,
            location: modulePath,
            suggestedFix: `Create directory: ${dirPath}`
          });
        }
      }

      // Check optional directories (just record, don't fail)
      for (const dir of this.optionalDirectories) {
        const dirPath = path.join(modulePath, dir);
        const exists = await this.pathExists(dirPath);
        result.structure.directories[dir] = exists;
      }

      // Check required files
      for (const file of this.requiredFiles) {
        const filePath = path.join(modulePath, file);
        const exists = await this.pathExists(filePath);
        result.structure.files[file] = exists;
        
        if (!exists) {
          result.passed = false;
          result.issues.push({
            type: 'MISSING_FILE',
            severity: 'CRITICAL',
            message: `Required file '${file}' is missing`,
            location: modulePath,
            suggestedFix: `Create file: ${filePath}`
          });
        } else {
          // Verify index.js has proper module registration
          const indexValid = await this.verifyIndexFile(filePath, moduleName);
          if (!indexValid.passed) {
            result.passed = false;
            result.issues.push(...indexValid.issues);
          }
        }
      }

      // Verify naming conventions
      const namingIssues = await this.verifyNamingConventions(modulePath, moduleName);
      if (namingIssues.length > 0) {
        result.passed = false;
        result.issues.push(...namingIssues);
      }

    } catch (error) {
      result.passed = false;
      result.issues.push({
        type: 'VERIFICATION_ERROR',
        severity: 'HIGH',
        message: `Error verifying module: ${error.message}`,
        location: modulePath
      });
    }

    return result;
  }

  /**
   * Verify index.js file has proper module registration
   * @param {string} filePath - Path to index.js file
   * @param {string} moduleName - Name of the module
   * @returns {Promise<Object>} Verification result
   */
  async verifyIndexFile(filePath, moduleName) {
    const result = {
      passed: true,
      issues: []
    };

    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check for registration function
      const hasRegistrationFunction = /function\s+register\w*Module/i.test(content) ||
                                      /const\s+register\w*Module\s*=/i.test(content);
      
      if (!hasRegistrationFunction) {
        result.passed = false;
        result.issues.push({
          type: 'MISSING_REGISTRATION',
          severity: 'HIGH',
          message: `index.js missing module registration function`,
          location: filePath,
          suggestedFix: `Add a registration function like 'registerModule' or 'register${this.capitalize(moduleName)}Module'`
        });
      }

      // Check for module.exports
      if (!content.includes('module.exports')) {
        result.passed = false;
        result.issues.push({
          type: 'MISSING_EXPORTS',
          severity: 'HIGH',
          message: `index.js missing module.exports`,
          location: filePath,
          suggestedFix: `Add module.exports with registration function and module components`
        });
      }

    } catch (error) {
      result.passed = false;
      result.issues.push({
        type: 'FILE_READ_ERROR',
        severity: 'HIGH',
        message: `Error reading index.js: ${error.message}`,
        location: filePath
      });
    }

    return result;
  }

  /**
   * Verify naming conventions in module
   * @param {string} modulePath - Path to module directory
   * @param {string} moduleName - Name of the module
   * @returns {Promise<Array>} List of naming issues
   */
  async verifyNamingConventions(modulePath, moduleName) {
    const issues = [];
    const expectedPrefix = this.capitalize(moduleName.replace(/-/g, ''));

    try {
      // Check controllers directory
      const controllersPath = path.join(modulePath, 'controllers');
      if (await this.pathExists(controllersPath)) {
        const controllers = await fs.readdir(controllersPath);
        for (const controller of controllers) {
          if (controller.endsWith('.js') && !controller.includes('Controller')) {
            issues.push({
              type: 'NAMING_CONVENTION',
              severity: 'MEDIUM',
              message: `Controller file '${controller}' should include 'Controller' in name`,
              location: path.join(controllersPath, controller),
              suggestedFix: `Rename to follow pattern: ${expectedPrefix}Controller.js`
            });
          }
        }
      }

      // Check services directory
      const servicesPath = path.join(modulePath, 'services');
      if (await this.pathExists(servicesPath)) {
        const services = await fs.readdir(servicesPath);
        for (const service of services) {
          if (service.endsWith('.js') && !service.includes('Service')) {
            issues.push({
              type: 'NAMING_CONVENTION',
              severity: 'MEDIUM',
              message: `Service file '${service}' should include 'Service' in name`,
              location: path.join(servicesPath, service),
              suggestedFix: `Rename to follow pattern: ${expectedPrefix}Service.js`
            });
          }
        }
      }

      // Check repositories directory
      const repositoriesPath = path.join(modulePath, 'repositories');
      if (await this.pathExists(repositoriesPath)) {
        const repositories = await fs.readdir(repositoriesPath);
        for (const repository of repositories) {
          if (repository.endsWith('.js') && !repository.includes('Repository')) {
            issues.push({
              type: 'NAMING_CONVENTION',
              severity: 'MEDIUM',
              message: `Repository file '${repository}' should include 'Repository' in name`,
              location: path.join(repositoriesPath, repository),
              suggestedFix: `Rename to follow pattern: ${expectedPrefix}Repository.js`
            });
          }
        }
      }

    } catch (error) {
      logger.error('Error verifying naming conventions', { error: error.message });
    }

    return issues;
  }

  /**
   * Verify controller patterns (extends BaseController, error handling)
   * @param {string} moduleName - Name of the module
   * @returns {Promise<Object>} Verification result
   */
  async verifyControllerPatterns(moduleName) {
    const result = {
      passed: true,
      controllers: [],
      issues: []
    };

    try {
      const controllersPath = path.join(this.modulesPath, moduleName, 'controllers');
      
      if (!await this.pathExists(controllersPath)) {
        result.passed = false;
        result.issues.push({
          type: 'MISSING_DIRECTORY',
          severity: 'HIGH',
          message: `Controllers directory not found`,
          location: controllersPath
        });
        return result;
      }

      const controllers = await fs.readdir(controllersPath);
      const jsControllers = controllers.filter(f => f.endsWith('.js'));

      for (const controllerFile of jsControllers) {
        const controllerPath = path.join(controllersPath, controllerFile);
        const controllerResult = await this.verifyControllerFile(controllerPath);
        
        result.controllers.push({
          file: controllerFile,
          ...controllerResult
        });

        if (!controllerResult.passed) {
          result.passed = false;
          result.issues.push(...controllerResult.issues);
        }
      }

    } catch (error) {
      result.passed = false;
      result.issues.push({
        type: 'VERIFICATION_ERROR',
        severity: 'HIGH',
        message: `Error verifying controller patterns: ${error.message}`,
        location: path.join(this.modulesPath, moduleName, 'controllers')
      });
    }

    return result;
  }

  /**
   * Verify a single controller file
   * @param {string} controllerPath - Path to controller file
   * @returns {Promise<Object>} Verification result
   */
  async verifyControllerFile(controllerPath) {
    const result = {
      passed: true,
      issues: [],
      patterns: {
        extendsBaseController: false,
        hasTryCatch: false,
        passesErrorsToNext: false
      }
    };

    try {
      const content = await fs.readFile(controllerPath, 'utf8');

      // Check if extends BaseController
      result.patterns.extendsBaseController = /extends\s+BaseController/.test(content);
      if (!result.patterns.extendsBaseController) {
        result.passed = false;
        result.issues.push({
          type: 'MISSING_BASE_CLASS',
          severity: 'HIGH',
          message: `Controller does not extend BaseController`,
          location: controllerPath,
          suggestedFix: `Make controller extend BaseController: class XController extends BaseController`
        });
      }

      // Check for try-catch blocks in methods
      const tryCatchPattern = /try\s*{[\s\S]*?}\s*catch\s*\(/g;
      const tryCatchMatches = content.match(tryCatchPattern);
      result.patterns.hasTryCatch = tryCatchMatches && tryCatchMatches.length > 0;
      
      if (!result.patterns.hasTryCatch) {
        result.passed = false;
        result.issues.push({
          type: 'MISSING_ERROR_HANDLING',
          severity: 'HIGH',
          message: `Controller methods missing try-catch blocks`,
          location: controllerPath,
          suggestedFix: `Wrap async operations in try-catch blocks`
        });
      }

      // Check if errors are passed to next()
      result.patterns.passesErrorsToNext = /next\s*\(\s*error\s*\)/.test(content);
      if (result.patterns.hasTryCatch && !result.patterns.passesErrorsToNext) {
        result.passed = false;
        result.issues.push({
          type: 'IMPROPER_ERROR_HANDLING',
          severity: 'MEDIUM',
          message: `Controller does not pass errors to next() middleware`,
          location: controllerPath,
          suggestedFix: `In catch blocks, call next(error) to pass errors to error handling middleware`
        });
      }

    } catch (error) {
      result.passed = false;
      result.issues.push({
        type: 'FILE_READ_ERROR',
        severity: 'HIGH',
        message: `Error reading controller file: ${error.message}`,
        location: controllerPath
      });
    }

    return result;
  }

  /**
   * Verify middleware consistency across routes
   * @param {Array} routes - Array of route information
   * @returns {Object} Verification result
   */
  verifyMiddlewareConsistency(routes) {
    const result = {
      passed: true,
      issues: [],
      analysis: {
        protectedRoutes: [],
        unprotectedRoutes: [],
        inconsistencies: []
      }
    };

    try {
      // Group routes by module
      const routesByModule = {};
      for (const route of routes) {
        if (!route.module) continue;
        
        if (!routesByModule[route.module]) {
          routesByModule[route.module] = [];
        }
        routesByModule[route.module].push(route);
      }

      // Check each module for consistency
      for (const [moduleName, moduleRoutes] of Object.entries(routesByModule)) {
        const authRoutes = moduleRoutes.filter(r => r.requiresAuth);
        const noAuthRoutes = moduleRoutes.filter(r => !r.requiresAuth);

        result.analysis.protectedRoutes.push(...authRoutes.map(r => ({
          module: moduleName,
          path: r.path,
          method: r.method
        })));

        result.analysis.unprotectedRoutes.push(...noAuthRoutes.map(r => ({
          module: moduleName,
          path: r.path,
          method: r.method
        })));

        // If module has both protected and unprotected routes, check if it makes sense
        if (authRoutes.length > 0 && noAuthRoutes.length > 0) {
          // This might be intentional (e.g., auth module has login/register without auth)
          // But flag it for review
          result.analysis.inconsistencies.push({
            module: moduleName,
            type: 'MIXED_AUTH',
            message: `Module has both protected (${authRoutes.length}) and unprotected (${noAuthRoutes.length}) routes`,
            protectedRoutes: authRoutes.map(r => `${r.method} ${r.path}`),
            unprotectedRoutes: noAuthRoutes.map(r => `${r.method} ${r.path}`)
          });
        }

        // Check if similar routes have similar middleware
        const crudRoutes = moduleRoutes.filter(r => 
          ['GET', 'POST', 'PUT', 'DELETE'].includes(r.method)
        );

        if (crudRoutes.length > 0) {
          const authStatus = crudRoutes.map(r => r.requiresAuth);
          const allSame = authStatus.every(val => val === authStatus[0]);
          
          if (!allSame) {
            result.passed = false;
            result.issues.push({
              type: 'INCONSISTENT_MIDDLEWARE',
              severity: 'MEDIUM',
              message: `Module '${moduleName}' has inconsistent authentication middleware on CRUD routes`,
              location: moduleName,
              details: crudRoutes.map(r => ({
                route: `${r.method} ${r.path}`,
                requiresAuth: r.requiresAuth
              })),
              suggestedFix: `Ensure all CRUD routes in the same module have consistent authentication requirements`
            });
          }
        }
      }

    } catch (error) {
      result.passed = false;
      result.issues.push({
        type: 'VERIFICATION_ERROR',
        severity: 'HIGH',
        message: `Error verifying middleware consistency: ${error.message}`
      });
    }

    return result;
  }

  /**
   * Check if a path exists
   * @param {string} path - Path to check
   * @returns {Promise<boolean>} True if path exists
   */
  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = ModuleStructureVerifier;
