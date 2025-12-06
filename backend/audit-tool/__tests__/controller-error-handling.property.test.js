/**
 * Property-Based Test: Controller Error Handling Pattern
 * 
 * **Feature: full-system-audit, Property 29: Controller Error Handling Pattern**
 * 
 * For any controller method, it should use try-catch blocks and pass errors 
 * to the next() middleware function.
 * 
 * **Validates: Requirements 8.2**
 */

const fc = require('fast-check');
const fs = require('fs').promises;
const path = require('path');
const ModuleStructureVerifier = require('../verifiers/ModuleStructureVerifier');

describe('Property 29: Controller Error Handling Pattern', () => {
  const modulesPath = path.join(__dirname, '../../src/modules');
  let verifier;

  beforeAll(() => {
    verifier = new ModuleStructureVerifier({
      modulesPath
    });
  });

  /**
   * Helper function to get all real modules
   * @returns {Promise<Array<string>>}
   */
  async function getRealModules() {
    try {
      const entries = await fs.readdir(modulesPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(name => !name.startsWith('.'));
    } catch (error) {
      return [];
    }
  }

  /**
   * Helper function to get all controller files in a module
   * @param {string} moduleName - Name of the module
   * @returns {Promise<Array<string>>}
   */
  async function getControllerFiles(moduleName) {
    const controllersPath = path.join(modulesPath, moduleName, 'controllers');
    try {
      const files = await fs.readdir(controllersPath);
      return files.filter(f => f.endsWith('.js'));
    } catch {
      return [];
    }
  }

  /**
   * Helper function to check if path exists
   * @param {string} checkPath - Path to check
   * @returns {Promise<boolean>}
   */
  async function pathExists(checkPath) {
    try {
      await fs.access(checkPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Property Test: All controllers extend BaseController
   */
  test('all controllers extend BaseController', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any controller, it must extend BaseController
    for (const moduleName of modules) {
      const controllerFiles = await getControllerFiles(moduleName);
      
      for (const controllerFile of controllerFiles) {
        const controllerPath = path.join(modulesPath, moduleName, 'controllers', controllerFile);
        const content = await fs.readFile(controllerPath, 'utf8');
        
        // Property: Every controller must extend BaseController
        expect(content).toMatch(/extends\s+BaseController/);
      }
    }
  }, 30000);

  /**
   * Property Test: All controllers have try-catch blocks
   */
  test('all controllers have try-catch error handling', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any controller, it must have try-catch blocks
    for (const moduleName of modules) {
      const controllerFiles = await getControllerFiles(moduleName);
      
      for (const controllerFile of controllerFiles) {
        const controllerPath = path.join(modulesPath, moduleName, 'controllers', controllerFile);
        const content = await fs.readFile(controllerPath, 'utf8');
        
        // Property: Every controller must have at least one try-catch block
        expect(content).toMatch(/try\s*{[\s\S]*?}\s*catch\s*\(/);
      }
    }
  }, 30000);

  /**
   * Property Test: All controllers pass errors to next()
   */
  test('all controllers pass errors to next() middleware', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any controller with try-catch, it must pass errors to next()
    for (const moduleName of modules) {
      const controllerFiles = await getControllerFiles(moduleName);
      
      for (const controllerFile of controllerFiles) {
        const controllerPath = path.join(modulesPath, moduleName, 'controllers', controllerFile);
        const content = await fs.readFile(controllerPath, 'utf8');
        
        // Check if controller has try-catch
        const hasTryCatch = /try\s*{[\s\S]*?}\s*catch\s*\(/.test(content);
        
        if (hasTryCatch) {
          // Property: If controller has try-catch, it must call next(error)
          expect(content).toMatch(/next\s*\(\s*error\s*\)/);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: verifyControllerPatterns detects missing BaseController
   */
  test('verifyControllerPatterns detects controllers not extending BaseController', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module, if a controller doesn't extend BaseController, it should be flagged
    for (const moduleName of modules) {
      const result = await verifier.verifyControllerPatterns(moduleName);
      
      for (const controller of result.controllers) {
        if (!controller.patterns.extendsBaseController) {
          // Property: Missing BaseController should result in failed verification
          expect(controller.passed).toBe(false);
          expect(controller.issues.length).toBeGreaterThan(0);
          expect(controller.issues.some(i => i.type === 'MISSING_BASE_CLASS')).toBe(true);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: verifyControllerPatterns detects missing try-catch
   */
  test('verifyControllerPatterns detects controllers without try-catch blocks', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module, if a controller lacks try-catch, it should be flagged
    for (const moduleName of modules) {
      const result = await verifier.verifyControllerPatterns(moduleName);
      
      for (const controller of result.controllers) {
        if (!controller.patterns.hasTryCatch) {
          // Property: Missing try-catch should result in failed verification
          expect(controller.passed).toBe(false);
          expect(controller.issues.length).toBeGreaterThan(0);
          expect(controller.issues.some(i => i.type === 'MISSING_ERROR_HANDLING')).toBe(true);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: verifyControllerPatterns detects improper error handling
   */
  test('verifyControllerPatterns detects controllers not passing errors to next()', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module, if a controller has try-catch but doesn't call next(error), it should be flagged
    for (const moduleName of modules) {
      const result = await verifier.verifyControllerPatterns(moduleName);
      
      for (const controller of result.controllers) {
        if (controller.patterns.hasTryCatch && !controller.patterns.passesErrorsToNext) {
          // Property: Improper error handling should result in failed verification
          expect(controller.passed).toBe(false);
          expect(controller.issues.length).toBeGreaterThan(0);
          expect(controller.issues.some(i => i.type === 'IMPROPER_ERROR_HANDLING')).toBe(true);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: Controllers with all patterns pass verification
   */
  test('controllers with all required patterns pass verification', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any controller with all required patterns, verification should pass
    for (const moduleName of modules) {
      const result = await verifier.verifyControllerPatterns(moduleName);
      
      for (const controller of result.controllers) {
        if (controller.patterns.extendsBaseController && 
            controller.patterns.hasTryCatch && 
            controller.patterns.passesErrorsToNext) {
          // Property: Controller with all patterns should pass
          expect(controller.passed).toBe(true);
          expect(controller.issues.length).toBe(0);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: verifyControllerFile is consistent for same file
   */
  test('verifyControllerFile returns consistent results for same file', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Get first module with controllers
    let testControllerPath = null;
    for (const moduleName of modules) {
      const controllerFiles = await getControllerFiles(moduleName);
      if (controllerFiles.length > 0) {
        testControllerPath = path.join(modulesPath, moduleName, 'controllers', controllerFiles[0]);
        break;
      }
    }

    if (!testControllerPath) {
      console.warn('No controllers found to test');
      return;
    }

    // Property: Verifying same controller multiple times should return same results
    await fc.assert(
      fc.asyncProperty(
        fc.constant(testControllerPath),
        async (controllerPath) => {
          const result1 = await verifier.verifyControllerFile(controllerPath);
          const result2 = await verifier.verifyControllerFile(controllerPath);
          
          // Property: Results should be consistent
          expect(result1.passed).toBe(result2.passed);
          expect(result1.patterns).toEqual(result2.patterns);
          expect(result1.issues.length).toBe(result2.issues.length);
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Property Test: All controller verification results have required fields
   */
  test('all controller verification results have required fields', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any controller verification result, it must have required fields
    for (const moduleName of modules) {
      const result = await verifier.verifyControllerPatterns(moduleName);
      
      // Property: Result must have required top-level fields
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('controllers');
      expect(result).toHaveProperty('issues');
      expect(typeof result.passed).toBe('boolean');
      expect(Array.isArray(result.controllers)).toBe(true);
      expect(Array.isArray(result.issues)).toBe(true);
      
      // Property: Each controller result must have required fields
      for (const controller of result.controllers) {
        expect(controller).toHaveProperty('file');
        expect(controller).toHaveProperty('passed');
        expect(controller).toHaveProperty('issues');
        expect(controller).toHaveProperty('patterns');
        expect(controller.patterns).toHaveProperty('extendsBaseController');
        expect(controller.patterns).toHaveProperty('hasTryCatch');
        expect(controller.patterns).toHaveProperty('passesErrorsToNext');
      }
    }
  }, 30000);
});
