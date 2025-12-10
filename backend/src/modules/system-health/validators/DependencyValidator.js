/**
 * Dependency Validation Service
 * Validates package.json files, node_modules, and dependency integrity
 */

const fs = require('fs').promises;
const path = require('path');

class DependencyValidator {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Validate dependencies for a project
   * @param {string} projectPath - Path to the project root
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateDependencies(projectPath = '.', options = {}) {
    const startTime = Date.now();
    
    try {
      this.logger?.debug('Starting dependency validation', { projectPath, options });

      const results = [];
      
      // Validate package.json files
      const packageJsonResult = await this.validatePackageJson(projectPath, options);
      results.push(packageJsonResult);

      // Validate node_modules
      const nodeModulesResult = await this.validateNodeModules(projectPath, options);
      results.push(nodeModulesResult);

      // Validate dependency integrity
      const integrityResult = await this.validateDependencyIntegrity(projectPath, options);
      results.push(integrityResult);

      // Check for security vulnerabilities (if enabled)
      if (options.checkSecurity !== false) {
        const securityResult = await this.validateDependencySecurity(projectPath, options);
        results.push(securityResult);
      }

      // Determine overall status
      const failedResults = results.filter(r => r.status === 'fail');
      const warningResults = results.filter(r => r.status === 'warning');
      
      const overallStatus = failedResults.length > 0 ? 'fail' : 
                           warningResults.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Dependencies Validation',
        status: overallStatus,
        message: this.generateDependencyMessage(overallStatus, results),
        details: {
          projectPath,
          results,
          summary: {
            total: results.length,
            passed: results.filter(r => r.status === 'pass').length,
            failed: failedResults.length,
            warnings: warningResults.length
          }
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger?.error('Dependency validation failed', error);
      
      return {
        name: 'Dependencies Validation',
        status: 'fail',
        message: `Dependency validation failed: ${error.message}`,
        details: { error: error.message, projectPath },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate package.json files
   * @param {string} projectPath - Path to the project root
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validatePackageJson(projectPath, options = {}) {
    const startTime = Date.now();
    
    try {
      const packagePaths = options.packagePaths || [
        path.join(projectPath, 'package.json'),
        path.join(projectPath, 'backend/package.json'),
        path.join(projectPath, 'frontend/package.json')
      ];

      const results = [];
      const missingFiles = [];
      const invalidFiles = [];

      for (const packagePath of packagePaths) {
        try {
          const content = await fs.readFile(packagePath, 'utf8');
          const packageJson = JSON.parse(content);
          
          const validation = this.validatePackageJsonContent(packageJson, packagePath);
          
          results.push({
            path: packagePath,
            exists: true,
            valid: validation.valid,
            name: packageJson.name,
            version: packageJson.version,
            dependencies: Object.keys(packageJson.dependencies || {}).length,
            devDependencies: Object.keys(packageJson.devDependencies || {}).length,
            scripts: Object.keys(packageJson.scripts || {}).length,
            issues: validation.issues
          });

          if (!validation.valid) {
            invalidFiles.push({ path: packagePath, issues: validation.issues });
          }
        } catch (error) {
          if (error.code === 'ENOENT') {
            // Only consider it missing if it's a required package.json
            if (packagePath.endsWith('/package.json') && !packagePath.includes('/')) {
              missingFiles.push(packagePath);
            }
            results.push({
              path: packagePath,
              exists: false,
              valid: false,
              error: 'File not found'
            });
          } else {
            invalidFiles.push({ path: packagePath, error: error.message });
            results.push({
              path: packagePath,
              exists: true,
              valid: false,
              error: error.message
            });
          }
        }
      }

      const validFiles = results.filter(r => r.exists && r.valid);
      const status = missingFiles.length > 0 || invalidFiles.length > 0 ? 'fail' : 'pass';

      return {
        name: 'Package.json Files',
        status,
        message: status === 'pass'
          ? `All ${validFiles.length} package.json files are valid`
          : `${missingFiles.length} missing, ${invalidFiles.length} invalid package.json files`,
        details: {
          totalChecked: packagePaths.length,
          validFiles: validFiles.length,
          missingFiles,
          invalidFiles,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Package.json Files',
        status: 'fail',
        message: `Package.json validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate node_modules directories
   * @param {string} projectPath - Path to the project root
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateNodeModules(projectPath, options = {}) {
    const startTime = Date.now();
    
    try {
      const nodeModulesPaths = options.nodeModulesPaths || [
        path.join(projectPath, 'node_modules'),
        path.join(projectPath, 'backend/node_modules'),
        path.join(projectPath, 'frontend/node_modules')
      ];

      const results = [];
      const missingDirs = [];
      const issues = [];

      for (const nodeModulesPath of nodeModulesPaths) {
        try {
          const stats = await fs.stat(nodeModulesPath);
          
          if (stats.isDirectory()) {
            const moduleCount = await this.countNodeModules(nodeModulesPath);
            const sizeInfo = await this.getNodeModulesSize(nodeModulesPath);
            
            results.push({
              path: nodeModulesPath,
              exists: true,
              moduleCount,
              size: sizeInfo.size,
              sizeFormatted: sizeInfo.formatted,
              valid: true
            });

            // Check for common issues
            if (moduleCount === 0) {
              issues.push({ path: nodeModulesPath, issue: 'No modules found' });
            }
          } else {
            issues.push({ path: nodeModulesPath, issue: 'Path exists but is not a directory' });
            results.push({
              path: nodeModulesPath,
              exists: true,
              valid: false,
              error: 'Not a directory'
            });
          }
        } catch (error) {
          if (error.code === 'ENOENT') {
            // Only consider missing if it's a main node_modules
            if (!nodeModulesPath.includes('/backend/') && !nodeModulesPath.includes('/frontend/')) {
              missingDirs.push(nodeModulesPath);
            }
            results.push({
              path: nodeModulesPath,
              exists: false,
              valid: false,
              error: 'Directory not found'
            });
          } else {
            issues.push({ path: nodeModulesPath, error: error.message });
            results.push({
              path: nodeModulesPath,
              exists: false,
              valid: false,
              error: error.message
            });
          }
        }
      }

      const validDirs = results.filter(r => r.exists && r.valid);
      const status = missingDirs.length > 0 || issues.length > 0 ? 
                   (missingDirs.length > 0 ? 'fail' : 'warning') : 'pass';

      return {
        name: 'Node Modules',
        status,
        message: status === 'pass'
          ? `All ${validDirs.length} node_modules directories are valid`
          : `${missingDirs.length} missing directories, ${issues.length} issues found`,
        details: {
          totalChecked: nodeModulesPaths.length,
          validDirs: validDirs.length,
          missingDirs,
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Node Modules',
        status: 'fail',
        message: `Node modules validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate dependency integrity
   * @param {string} projectPath - Path to the project root
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateDependencyIntegrity(projectPath, options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const issues = [];

      // Check for package-lock.json files
      const lockFiles = [
        path.join(projectPath, 'package-lock.json'),
        path.join(projectPath, 'backend/package-lock.json'),
        path.join(projectPath, 'frontend/package-lock.json')
      ];

      for (const lockFile of lockFiles) {
        try {
          await fs.access(lockFile);
          results.push({
            type: 'lock-file',
            path: lockFile,
            exists: true,
            valid: true
          });
        } catch (error) {
          // Only warn if the corresponding package.json exists
          const packageJsonPath = lockFile.replace('package-lock.json', 'package.json');
          try {
            await fs.access(packageJsonPath);
            issues.push({
              type: 'missing-lock-file',
              path: lockFile,
              message: 'package-lock.json missing but package.json exists'
            });
          } catch (packageError) {
            // Both missing, that's fine
          }
          
          results.push({
            type: 'lock-file',
            path: lockFile,
            exists: false,
            valid: false
          });
        }
      }

      // Check for conflicting versions (simplified check)
      const versionConflicts = await this.checkVersionConflicts(projectPath);
      if (versionConflicts.length > 0) {
        issues.push(...versionConflicts);
      }

      const status = issues.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Dependency Integrity',
        status,
        message: status === 'pass'
          ? 'Dependency integrity checks passed'
          : `${issues.length} integrity issues found`,
        details: {
          lockFiles: results.filter(r => r.type === 'lock-file'),
          versionConflicts,
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Dependency Integrity',
        status: 'fail',
        message: `Dependency integrity validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate dependency security
   * @param {string} projectPath - Path to the project root
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateDependencySecurity(projectPath, options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const vulnerabilities = [];
      const warnings = [];

      // Check for known vulnerable packages (simplified check)
      const knownVulnerable = [
        'lodash@4.17.15', // Example - old version with known issues
        'moment@2.24.0',  // Example - old version
        'axios@0.18.0'    // Example - old version
      ];

      // This is a simplified security check
      // In a real implementation, you'd integrate with npm audit or similar
      const packagePaths = [
        path.join(projectPath, 'package.json'),
        path.join(projectPath, 'backend/package.json'),
        path.join(projectPath, 'frontend/package.json')
      ];

      for (const packagePath of packagePaths) {
        try {
          const content = await fs.readFile(packagePath, 'utf8');
          const packageJson = JSON.parse(content);
          
          const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
          };

          for (const [depName, depVersion] of Object.entries(allDeps || {})) {
            const depString = `${depName}@${depVersion}`;
            
            // Check against known vulnerable packages
            const isVulnerable = knownVulnerable.some(vuln => 
              depString.includes(vuln.split('@')[0])
            );

            if (isVulnerable) {
              vulnerabilities.push({
                package: depName,
                version: depVersion,
                file: packagePath,
                severity: 'medium',
                description: 'Known vulnerable version detected'
              });
            }

            // Check for very old packages (simplified heuristic)
            if (depVersion.startsWith('^0.') || depVersion.startsWith('~0.')) {
              warnings.push({
                package: depName,
                version: depVersion,
                file: packagePath,
                type: 'outdated',
                description: 'Very old version detected'
              });
            }
          }

          results.push({
            file: packagePath,
            dependencies: Object.keys(allDeps || {}).length,
            vulnerabilities: vulnerabilities.filter(v => v.file === packagePath).length,
            warnings: warnings.filter(w => w.file === packagePath).length
          });
        } catch (error) {
          // Skip files that don't exist or can't be parsed
          continue;
        }
      }

      const status = vulnerabilities.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Dependency Security',
        status,
        message: status === 'pass'
          ? 'No security issues detected'
          : `${vulnerabilities.length} vulnerabilities, ${warnings.length} warnings`,
        details: {
          vulnerabilities,
          warnings,
          results,
          note: 'This is a simplified security check. Use npm audit for comprehensive security analysis.'
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Dependency Security',
        status: 'fail',
        message: `Dependency security validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate package.json content
   * @param {Object} packageJson - Parsed package.json content
   * @param {string} filePath - Path to the package.json file
   * @returns {Object} Validation result
   */
  validatePackageJsonContent(packageJson, filePath) {
    const issues = [];

    // Required fields
    const requiredFields = ['name', 'version'];
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // Validate name format
    if (packageJson.name && !/^[a-z0-9-_@/]+$/.test(packageJson.name)) {
      issues.push('Package name contains invalid characters');
    }

    // Validate version format (basic semver check)
    if (packageJson.version && !/^\d+\.\d+\.\d+/.test(packageJson.version)) {
      issues.push('Version does not follow semantic versioning');
    }

    // Check for scripts (recommended)
    if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
      issues.push('No scripts defined (recommended to have at least start/test scripts)');
    }

    // Check for dependencies
    const hasDeps = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
    const hasDevDeps = packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0;
    
    if (!hasDeps && !hasDevDeps) {
      issues.push('No dependencies defined');
    }

    // Check for common security issues
    if (packageJson.scripts) {
      for (const [scriptName, scriptContent] of Object.entries(packageJson.scripts)) {
        if (typeof scriptContent === 'string' && scriptContent.includes('rm -rf /')) {
          issues.push(`Potentially dangerous script: ${scriptName}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Count modules in node_modules directory
   * @param {string} nodeModulesPath - Path to node_modules
   * @returns {Promise<number>} Number of modules
   */
  async countNodeModules(nodeModulesPath) {
    try {
      const entries = await fs.readdir(nodeModulesPath);
      // Filter out .bin and other non-package directories
      const packages = entries.filter(entry => 
        !entry.startsWith('.') && 
        entry !== '.bin' && 
        entry !== '.cache'
      );
      return packages.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get node_modules directory size information
   * @param {string} nodeModulesPath - Path to node_modules
   * @returns {Promise<Object>} Size information
   */
  async getNodeModulesSize(nodeModulesPath) {
    try {
      // This is a simplified size calculation
      // In a real implementation, you'd recursively calculate directory size
      const stats = await fs.stat(nodeModulesPath);
      const size = stats.size || 0;
      
      return {
        size,
        formatted: this.formatBytes(size)
      };
    } catch (error) {
      return {
        size: 0,
        formatted: '0 B'
      };
    }
  }

  /**
   * Check for version conflicts
   * @param {string} projectPath - Path to the project root
   * @returns {Promise<Array>} Array of version conflicts
   */
  async checkVersionConflicts(projectPath) {
    const conflicts = [];
    
    try {
      // This is a simplified version conflict check
      // In a real implementation, you'd parse package-lock.json and check for conflicts
      
      const packagePaths = [
        path.join(projectPath, 'backend/package.json'),
        path.join(projectPath, 'frontend/package.json')
      ];

      const allDependencies = new Map();

      for (const packagePath of packagePaths) {
        try {
          const content = await fs.readFile(packagePath, 'utf8');
          const packageJson = JSON.parse(content);
          
          const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
          
          for (const [depName, depVersion] of Object.entries(deps || {})) {
            if (allDependencies.has(depName)) {
              const existingVersion = allDependencies.get(depName);
              if (existingVersion !== depVersion) {
                conflicts.push({
                  type: 'version-conflict',
                  package: depName,
                  versions: [existingVersion, depVersion],
                  message: `${depName} has conflicting versions: ${existingVersion} vs ${depVersion}`
                });
              }
            } else {
              allDependencies.set(depName, depVersion);
            }
          }
        } catch (error) {
          // Skip files that can't be read
          continue;
        }
      }
    } catch (error) {
      // Return empty conflicts if check fails
    }

    return conflicts;
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate dependency validation message
   * @param {string} status - Overall status
   * @param {Array} results - Validation results
   * @returns {string} Status message
   */
  generateDependencyMessage(status, results) {
    const totalChecks = results.length;
    const passedChecks = results.filter(r => r.status === 'pass').length;
    const failedChecks = results.filter(r => r.status === 'fail').length;
    const warningChecks = results.filter(r => r.status === 'warning').length;

    if (status === 'pass') {
      return `All ${totalChecks} dependency checks passed`;
    } else if (status === 'warning') {
      return `${passedChecks}/${totalChecks} checks passed, ${warningChecks} warnings`;
    } else {
      return `${failedChecks}/${totalChecks} checks failed, ${warningChecks} warnings`;
    }
  }
}

module.exports = DependencyValidator;