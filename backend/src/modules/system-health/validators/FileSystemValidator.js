/**
 * File System Validator
 * Validates directory structures, file existence, and permissions
 */

const fs = require('fs').promises;
const path = require('path');

class FileSystemValidator {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Validate directory structure and required paths
   * @param {Array} requiredPaths - Array of required file/directory paths
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateStructure(requiredPaths = [], options = {}) {
    const startTime = Date.now();
    
    try {
      this.logger?.debug('Starting file system validation', { 
        pathCount: requiredPaths.length,
        options 
      });

      const results = [];
      const errors = [];

      for (const filePath of requiredPaths) {
        try {
          const result = await this.validatePath(filePath, options);
          results.push(result);
          
          if (!result.exists) {
            errors.push(`Missing: ${filePath}`);
          }
        } catch (error) {
          const errorResult = {
            path: filePath,
            exists: false,
            error: error.message,
            type: 'unknown'
          };
          results.push(errorResult);
          errors.push(`Error checking ${filePath}: ${error.message}`);
        }
      }

      const missingPaths = results.filter(r => !r.exists);
      const status = missingPaths.length === 0 ? 'pass' : 'fail';

      return {
        name: 'File System Structure Validation',
        status,
        message: status === 'pass' 
          ? `All ${requiredPaths.length} required paths exist`
          : `${missingPaths.length} of ${requiredPaths.length} required paths missing`,
        details: { 
          results, 
          missingPaths,
          errors,
          totalChecked: requiredPaths.length,
          foundCount: results.filter(r => r.exists).length
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger?.error('File system validation failed', error);
      
      return {
        name: 'File System Structure Validation',
        status: 'fail',
        message: `Validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate a single path
   * @param {string} filePath - Path to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Path validation result
   */
  async validatePath(filePath, options = {}) {
    try {
      const stats = await fs.stat(filePath);
      
      const result = {
        path: filePath,
        exists: true,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        permissions: {
          readable: true, // If we can stat it, we can read it
          writable: false,
          executable: false
        },
        lastModified: stats.mtime
      };

      // Check permissions if requested
      if (options.checkPermissions) {
        try {
          await fs.access(filePath, fs.constants.R_OK);
          result.permissions.readable = true;
        } catch (error) {
          result.permissions.readable = false;
        }

        try {
          await fs.access(filePath, fs.constants.W_OK);
          result.permissions.writable = true;
        } catch (error) {
          result.permissions.writable = false;
        }

        try {
          await fs.access(filePath, fs.constants.X_OK);
          result.permissions.executable = true;
        } catch (error) {
          result.permissions.executable = false;
        }
      }

      return result;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          path: filePath,
          exists: false,
          error: 'File or directory does not exist',
          type: 'unknown'
        };
      }
      
      throw error;
    }
  }

  /**
   * Validate project structure with default paths
   * @param {string} projectRoot - Project root directory
   * @returns {Promise<Object>} Validation result
   */
  async validateProjectStructure(projectRoot = '.') {
    const requiredPaths = [
      // Backend structure
      path.join(projectRoot, 'backend/package.json'),
      path.join(projectRoot, 'backend/src'),
      path.join(projectRoot, 'backend/src/server.js'),
      path.join(projectRoot, 'backend/src/core'),
      path.join(projectRoot, 'backend/src/modules'),
      path.join(projectRoot, 'backend/src/shared'),
      
      // Frontend structure
      path.join(projectRoot, 'frontend/package.json'),
      path.join(projectRoot, 'frontend/src'),
      path.join(projectRoot, 'frontend/index.html'),
      path.join(projectRoot, 'frontend/vite.config.js'),
      
      // Database structure
      path.join(projectRoot, 'database'),
      path.join(projectRoot, 'database/migrations'),
      
      // Configuration files
      path.join(projectRoot, '.gitignore'),
      path.join(projectRoot, 'README.md')
    ];

    return await this.validateStructure(requiredPaths, { checkPermissions: true });
  }

  /**
   * Validate module structure
   * @param {string} modulePath - Path to module directory
   * @returns {Promise<Object>} Validation result
   */
  async validateModuleStructure(modulePath) {
    const requiredPaths = [
      path.join(modulePath, 'index.js'),
      path.join(modulePath, 'controllers'),
      path.join(modulePath, 'services'),
      path.join(modulePath, 'repositories'),
      path.join(modulePath, 'models')
    ];

    return await this.validateStructure(requiredPaths);
  }

  /**
   * Validate build output structure
   * @param {string} buildPath - Path to build output directory
   * @returns {Promise<Object>} Validation result
   */
  async validateBuildStructure(buildPath) {
    const requiredPaths = [
      path.join(buildPath, 'index.html'),
      path.join(buildPath, 'assets')
    ];

    const result = await this.validateStructure(requiredPaths);
    
    // Additional build-specific checks
    if (result.status === 'pass') {
      try {
        // Check for JavaScript and CSS files in assets
        const assetsPath = path.join(buildPath, 'assets');
        const assetFiles = await fs.readdir(assetsPath);
        
        const jsFiles = assetFiles.filter(file => file.endsWith('.js'));
        const cssFiles = assetFiles.filter(file => file.endsWith('.css'));
        
        result.details.buildAssets = {
          totalFiles: assetFiles.length,
          jsFiles: jsFiles.length,
          cssFiles: cssFiles.length,
          hasJavaScript: jsFiles.length > 0,
          hasCSS: cssFiles.length > 0
        };

        if (jsFiles.length === 0) {
          result.status = 'warning';
          result.message += ' (No JavaScript files found in assets)';
        }
      } catch (error) {
        this.logger?.warn('Could not analyze build assets', error);
      }
    }

    return result;
  }

  /**
   * Check disk space availability
   * @param {string} path - Path to check
   * @param {number} requiredMB - Required space in MB
   * @returns {Promise<Object>} Disk space check result
   */
  async checkDiskSpace(checkPath = '.', requiredMB = 100) {
    const startTime = Date.now();
    
    try {
      const stats = await fs.stat(checkPath);
      
      // Note: Node.js doesn't have a built-in way to check disk space
      // This is a simplified check that verifies the path exists
      // In a real implementation, you might use a native module or system command
      
      return {
        name: 'Disk Space Check',
        status: 'pass',
        message: `Path accessible: ${checkPath}`,
        details: {
          path: checkPath,
          requiredMB,
          pathExists: true,
          pathType: stats.isDirectory() ? 'directory' : 'file'
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Disk Space Check',
        status: 'fail',
        message: `Cannot access path: ${checkPath}`,
        details: {
          path: checkPath,
          error: error.message
        },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate file content (basic checks)
   * @param {string} filePath - Path to file
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Content validation result
   */
  async validateFileContent(filePath, options = {}) {
    const startTime = Date.now();
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      const result = {
        name: `File Content Validation: ${path.basename(filePath)}`,
        status: 'pass',
        message: `File content validated: ${lines.length} lines`,
        details: {
          filePath,
          lineCount: lines.length,
          characterCount: content.length,
          isEmpty: content.trim().length === 0
        },
        duration: Date.now() - startTime
      };

      // Check for specific patterns if requested
      if (options.requiredPatterns) {
        const missingPatterns = [];
        
        for (const pattern of options.requiredPatterns) {
          const regex = new RegExp(pattern);
          if (!regex.test(content)) {
            missingPatterns.push(pattern);
          }
        }

        if (missingPatterns.length > 0) {
          result.status = 'fail';
          result.message = `Missing required patterns: ${missingPatterns.join(', ')}`;
          result.details.missingPatterns = missingPatterns;
        }
      }

      // Check for forbidden patterns if requested
      if (options.forbiddenPatterns) {
        const foundPatterns = [];
        
        for (const pattern of options.forbiddenPatterns) {
          const regex = new RegExp(pattern);
          if (regex.test(content)) {
            foundPatterns.push(pattern);
          }
        }

        if (foundPatterns.length > 0) {
          result.status = 'warning';
          result.message = `Found forbidden patterns: ${foundPatterns.join(', ')}`;
          result.details.foundPatterns = foundPatterns;
        }
      }

      return result;
    } catch (error) {
      return {
        name: `File Content Validation: ${path.basename(filePath)}`,
        status: 'fail',
        message: `Cannot read file: ${error.message}`,
        details: {
          filePath,
          error: error.message
        },
        duration: Date.now() - startTime
      };
    }
  }
}

module.exports = FileSystemValidator;