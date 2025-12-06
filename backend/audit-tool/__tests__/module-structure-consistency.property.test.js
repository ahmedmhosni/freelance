/**
 * Property-Based Test: Module Structure Consistency
 * 
 * **Feature: full-system-audit, Property 28: Module Structure Consistency**
 * 
 * For any module in the modular architecture, it should contain the standard 
 * directories: controllers, services, repositories, and an index.js file.
 * 
 * **Validates: Requirements 8.1**
 */

const fc = require('fast-check');
const fs = require('fs').promises;
const path = require('path');
const ModuleStructureVerifier = require('../verifiers/ModuleStructureVerifier');

describe('Property 28: Module Structure Consistency', () => {
  const modulesPath = path.join(__dirname, '../../src/modules');
  let verifier;

  beforeAll(() => {
    verifier = new ModuleStructureVerifier({
      modulesPath
    });
  });

  /**
   * Helper function to check if a path exists
   * @param {string} path - Path to check
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
   * Property Test: All real modules have required directories
   */
  test('all modules have required directories (controllers, services)', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module, it must have controllers and services directories
    for (const moduleName of modules) {
      const modulePath = path.join(modulesPath, moduleName);
      
      const controllersPath = path.join(modulePath, 'controllers');
      const servicesPath = path.join(modulePath, 'services');
      
      const hasControllers = await pathExists(controllersPath);
      const hasServices = await pathExists(servicesPath);
      
      // Property: Every module must have controllers directory
      expect(hasControllers).toBe(true);
      
      // Property: Every module must have services directory
      expect(hasServices).toBe(true);
    }
  }, 30000);

  /**
   * Property Test: All real modules have index.js file
   */
  test('all modules have index.js registration file', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module, it must have an index.js file
    for (const moduleName of modules) {
      const modulePath = path.join(modulesPath, moduleName);
      const indexPath = path.join(modulePath, 'index.js');
      
      const hasIndex = await pathExists(indexPath);
      
      // Property: Every module must have index.js
      expect(hasIndex).toBe(true);
    }
  }, 30000);

  /**
   * Property Test: All index.js files have module registration function
   */
  test('all index.js files contain module registration function', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module's index.js, it must have a registration function
    for (const moduleName of modules) {
      const indexPath = path.join(modulesPath, moduleName, 'index.js');
      
      if (await pathExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf8');
        
        // Check for registration function pattern
        const hasRegistrationFunction = /function\s+register\w*Module/i.test(content) ||
                                        /const\s+register\w*Module\s*=/i.test(content);
        
        // Property: Every index.js must have a registration function
        expect(hasRegistrationFunction).toBe(true);
      }
    }
  }, 30000);

  /**
   * Property Test: All index.js files export their registration function
   */
  test('all index.js files export module components', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module's index.js, it must export via module.exports
    for (const moduleName of modules) {
      const indexPath = path.join(modulesPath, moduleName, 'index.js');
      
      if (await pathExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf8');
        
        // Property: Every index.js must have module.exports
        expect(content).toContain('module.exports');
      }
    }
  }, 30000);

  /**
   * Property Test: Controller files follow naming convention
   */
  test('controller files include "Controller" in their name', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any controller file, it must include "Controller" in the name
    for (const moduleName of modules) {
      const controllersPath = path.join(modulesPath, moduleName, 'controllers');
      
      if (await pathExists(controllersPath)) {
        const files = await fs.readdir(controllersPath);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        for (const file of jsFiles) {
          // Property: Every controller file must include "Controller" in name
          expect(file).toMatch(/Controller/);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: Service files follow naming convention
   */
  test('service files include "Service" in their name', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any service file, it must include "Service" in the name
    for (const moduleName of modules) {
      const servicesPath = path.join(modulesPath, moduleName, 'services');
      
      if (await pathExists(servicesPath)) {
        const files = await fs.readdir(servicesPath);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        for (const file of jsFiles) {
          // Property: Every service file must include "Service" in name
          expect(file).toMatch(/Service/);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: Repository files follow naming convention (if they exist)
   */
  test('repository files include "Repository" in their name', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any repository file, it must include "Repository" in the name
    for (const moduleName of modules) {
      const repositoriesPath = path.join(modulesPath, moduleName, 'repositories');
      
      if (await pathExists(repositoriesPath)) {
        const files = await fs.readdir(repositoriesPath);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        for (const file of jsFiles) {
          // Property: Every repository file must include "Repository" in name
          expect(file).toMatch(/Repository/);
        }
      }
    }
  }, 30000);

  /**
   * Property Test: Module structure verification returns consistent results
   */
  test('verifyModule returns consistent structure for same module', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module, verifying it multiple times should return same structure
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...modules),
        async (moduleName) => {
          const result1 = await verifier.verifyModule(moduleName);
          const result2 = await verifier.verifyModule(moduleName);
          
          // Property: Structure should be consistent across multiple verifications
          expect(result1.moduleName).toBe(result2.moduleName);
          expect(result1.structure.directories).toEqual(result2.structure.directories);
          expect(result1.structure.files).toEqual(result2.structure.files);
          expect(result1.passed).toBe(result2.passed);
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Property Test: Modules with all required components pass verification
   */
  test('modules with required directories and files pass verification', async () => {
    const modules = await getRealModules();
    
    // Skip test if no modules found
    if (modules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    // Property: For any module with all required components, verification should pass
    for (const moduleName of modules) {
      const modulePath = path.join(modulesPath, moduleName);
      
      const hasControllers = await pathExists(path.join(modulePath, 'controllers'));
      const hasServices = await pathExists(path.join(modulePath, 'services'));
      const hasIndex = await pathExists(path.join(modulePath, 'index.js'));
      
      if (hasControllers && hasServices && hasIndex) {
        const result = await verifier.verifyModule(moduleName);
        
        // Property: Module with all required components should have these directories marked as existing
        expect(result.structure.directories.controllers).toBe(true);
        expect(result.structure.directories.services).toBe(true);
        expect(result.structure.files['index.js']).toBe(true);
      }
    }
  }, 30000);

  /**
   * Property Test: verifyAllModules discovers all real modules
   */
  test('verifyAllModules discovers all existing modules', async () => {
    const realModules = await getRealModules();
    
    // Skip test if no modules found
    if (realModules.length === 0) {
      console.warn('No modules found to test');
      return;
    }

    const results = await verifier.verifyAllModules();
    
    // Property: All real modules should be discovered and verified
    expect(results.totalModules).toBe(realModules.length);
    
    // Property: Each real module should appear in results
    for (const moduleName of realModules) {
      const moduleResult = results.modules.find(m => m.moduleName === moduleName);
      expect(moduleResult).toBeDefined();
    }
  }, 30000);
});
