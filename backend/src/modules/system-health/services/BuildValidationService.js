/**
 * Build Validation Service
 * Validates frontend build process and output within the service layer
 */

const BaseService = require('../../../shared/base/BaseService');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class BuildValidationService extends BaseService {
  constructor(database, logger, config, buildResultRepository) {
    super(buildResultRepository);
    this.database = database;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Clean build artifacts from specified path
   * @param {string} buildPath - Path to build directory
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanBuildArtifacts(buildPath = 'frontend/dist') {
    const startTime = Date.now();
    
    try {
      this.logger.info('Cleaning build artifacts', { buildPath });
      
      const fullPath = path.resolve(buildPath);
      
      // Check if build directory exists
      try {
        await fs.access(fullPath);
        // Remove the directory and all its contents
        await fs.rm(fullPath, { recursive: true, force: true });
        this.logger.info('Build artifacts cleaned successfully', { buildPath: fullPath });
      } catch (error) {
        if (error.code === 'ENOENT') {
          this.logger.info('Build directory does not exist, nothing to clean', { buildPath: fullPath });
        } else {
          throw error;
        }
      }

      return {
        name: 'build_cleanup',
        status: 'pass',
        message: 'Build artifacts cleaned successfully',
        details: { buildPath: fullPath },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Failed to clean build artifacts', error);
      return {
        name: 'build_cleanup',
        status: 'fail',
        message: `Failed to clean build artifacts: ${error.message}`,
        details: { buildPath, error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate build process by running frontend build
   * @param {string} projectPath - Path to frontend project
   * @returns {Promise<Object>} Build validation result
   */
  async validateBuildProcess(projectPath = 'frontend') {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting build process validation', { projectPath });
      
      const fullPath = path.resolve(projectPath);
      
      // Check if package.json exists
      const packageJsonPath = path.join(fullPath, 'package.json');
      await fs.access(packageJsonPath);
      
      // Read package.json to check for build script
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts || !packageJson.scripts.build) {
        throw new Error('No build script found in package.json');
      }

      // Run the build process
      this.logger.info('Executing build command', { command: 'npm run build' });
      
      const buildOutput = execSync('npm run build', {
        cwd: fullPath,
        encoding: 'utf8',
        timeout: 300000, // 5 minutes timeout
        stdio: 'pipe'
      });

      this.logger.info('Build process completed successfully');

      return {
        name: 'build_process',
        status: 'pass',
        message: 'Build process completed successfully',
        details: { 
          projectPath: fullPath,
          buildScript: packageJson.scripts.build,
          output: buildOutput.substring(0, 1000) // Limit output size
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Build process validation failed', error);
      return {
        name: 'build_process',
        status: 'fail',
        message: `Build process failed: ${error.message}`,
        details: { 
          projectPath,
          error: error.message,
          stderr: error.stderr ? error.stderr.substring(0, 1000) : undefined
        },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Check build output files and structure
   * @param {string} distPath - Path to build output directory
   * @returns {Promise<Object>} Build output validation result
   */
  async checkBuildOutput(distPath = 'frontend/dist') {
    const startTime = Date.now();
    
    try {
      this.logger.info('Checking build output', { distPath });
      
      const fullPath = path.resolve(distPath);
      
      // Check if dist directory exists
      await fs.access(fullPath);
      
      // Get all files in the dist directory
      const files = await this.getFilesRecursively(fullPath);
      
      // Check for required files
      const requiredFiles = ['index.html'];
      const requiredExtensions = ['.js', '.css'];
      
      const missingFiles = [];
      const foundExtensions = new Set();
      
      // Check for index.html
      const hasIndexHtml = files.some(file => path.basename(file) === 'index.html');
      if (!hasIndexHtml) {
        missingFiles.push('index.html');
      }
      
      // Check for JS and CSS files
      files.forEach(file => {
        const ext = path.extname(file);
        if (requiredExtensions.includes(ext)) {
          foundExtensions.add(ext);
        }
      });
      
      requiredExtensions.forEach(ext => {
        if (!foundExtensions.has(ext)) {
          missingFiles.push(`*${ext} files`);
        }
      });

      const isValid = missingFiles.length === 0;
      
      return {
        name: 'build_output',
        status: isValid ? 'pass' : 'fail',
        message: isValid ? 'Build output validation passed' : `Missing required files: ${missingFiles.join(', ')}`,
        details: {
          distPath: fullPath,
          totalFiles: files.length,
          foundFiles: files.map(f => path.relative(fullPath, f)),
          missingFiles,
          foundExtensions: Array.from(foundExtensions)
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Build output validation failed', error);
      return {
        name: 'build_output',
        status: 'fail',
        message: `Build output validation failed: ${error.message}`,
        details: { distPath, error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze bundle size and performance metrics
   * @param {Array} assets - Array of asset file paths
   * @returns {Promise<Object>} Bundle analysis result
   */
  async analyzeBundleSize(assets = []) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Analyzing bundle size', { assetCount: assets.length });
      
      if (assets.length === 0) {
        // If no assets provided, scan the dist directory
        const distPath = path.resolve('frontend/dist');
        assets = await this.getFilesRecursively(distPath);
      }

      const bundleAnalysis = {
        total: 0,
        javascript: 0,
        css: 0,
        assets: 0,
        files: []
      };

      // Analyze each asset
      for (const assetPath of assets) {
        try {
          const stats = await fs.stat(assetPath);
          const size = stats.size;
          const ext = path.extname(assetPath).toLowerCase();
          
          bundleAnalysis.total += size;
          bundleAnalysis.files.push({
            name: path.basename(assetPath),
            size,
            type: this.getAssetType(ext),
            optimized: this.isOptimized(assetPath, ext)
          });

          // Categorize by type
          if (['.js', '.mjs'].includes(ext)) {
            bundleAnalysis.javascript += size;
          } else if (ext === '.css') {
            bundleAnalysis.css += size;
          } else {
            bundleAnalysis.assets += size;
          }
        } catch (error) {
          this.logger.warn('Failed to analyze asset', { assetPath, error: error.message });
        }
      }

      // Check size thresholds (configurable)
      const thresholds = {
        total: 5 * 1024 * 1024, // 5MB
        javascript: 2 * 1024 * 1024, // 2MB
        css: 500 * 1024 // 500KB
      };

      const warnings = [];
      if (bundleAnalysis.total > thresholds.total) {
        warnings.push(`Total bundle size (${this.formatBytes(bundleAnalysis.total)}) exceeds recommended limit (${this.formatBytes(thresholds.total)})`);
      }
      if (bundleAnalysis.javascript > thresholds.javascript) {
        warnings.push(`JavaScript bundle size (${this.formatBytes(bundleAnalysis.javascript)}) exceeds recommended limit (${this.formatBytes(thresholds.javascript)})`);
      }
      if (bundleAnalysis.css > thresholds.css) {
        warnings.push(`CSS bundle size (${this.formatBytes(bundleAnalysis.css)}) exceeds recommended limit (${this.formatBytes(thresholds.css)})`);
      }

      const status = warnings.length > 0 ? 'warning' : 'pass';

      return {
        name: 'bundle_analysis',
        status,
        message: warnings.length > 0 ? 'Bundle size warnings detected' : 'Bundle size analysis passed',
        details: {
          bundleSize: bundleAnalysis,
          warnings,
          thresholds
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Bundle size analysis failed', error);
      return {
        name: 'bundle_analysis',
        status: 'fail',
        message: `Bundle size analysis failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate production readiness of build artifacts
   * @param {Array} buildArtifacts - Array of build artifact paths
   * @returns {Promise<Object>} Production readiness validation result
   */
  async validateProductionReadiness(buildArtifacts = []) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Validating production readiness');
      
      if (buildArtifacts.length === 0) {
        // If no artifacts provided, scan the dist directory
        const distPath = path.resolve('frontend/dist');
        buildArtifacts = await this.getFilesRecursively(distPath);
      }

      const issues = [];
      const devReferences = [
        'localhost',
        'console.log',
        'debugger',
        'development',
        'dev-server',
        'hot-reload'
      ];

      // Check each file for development references
      for (const filePath of buildArtifacts) {
        const ext = path.extname(filePath).toLowerCase();
        
        // Only check text files
        if (['.js', '.css', '.html', '.json'].includes(ext)) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            
            for (const devRef of devReferences) {
              if (content.includes(devRef)) {
                issues.push({
                  file: path.basename(filePath),
                  issue: `Contains development reference: ${devRef}`,
                  type: 'development_reference'
                });
              }
            }

            // Check for source maps in production
            if (content.includes('sourceMappingURL') && ext === '.js') {
              issues.push({
                file: path.basename(filePath),
                issue: 'Contains source map reference in production build',
                type: 'source_map'
              });
            }
          } catch (error) {
            this.logger.warn('Failed to read file for production validation', { filePath, error: error.message });
          }
        }
      }

      const isProductionReady = issues.length === 0;

      return {
        name: 'production_readiness',
        status: isProductionReady ? 'pass' : 'warning',
        message: isProductionReady ? 'Production readiness validation passed' : `Found ${issues.length} production readiness issues`,
        details: {
          issues,
          checkedFiles: buildArtifacts.length,
          devReferencesChecked: devReferences
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Production readiness validation failed', error);
      return {
        name: 'production_readiness',
        status: 'fail',
        message: `Production readiness validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Save build result to database
   * @param {Object} buildResult - Build validation result
   * @returns {Promise<Object>} Saved result
   */
  async saveBuildResult(buildResult) {
    if (!this.repository) {
      this.logger.warn('No repository available to save build result');
      return buildResult;
    }

    try {
      const saved = await this.repository.create({
        timestamp: new Date(),
        build_path: buildResult.buildPath || 'frontend',
        status: buildResult.status || 'unknown',
        assets: JSON.stringify(buildResult.assets || []),
        bundle_size: JSON.stringify(buildResult.bundleSize || {}),
        warnings: JSON.stringify(buildResult.warnings || []),
        errors: JSON.stringify(buildResult.errors || []),
        duration: buildResult.duration || 0
      });

      this.logger.info('Build result saved to database', { id: saved.id });
      return saved;
    } catch (error) {
      this.logger.error('Failed to save build result', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive build report
   * @param {Array} results - Array of validation results
   * @returns {Object} Build report
   */
  generateBuildReport(results) {
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warning').length
    };

    const overallStatus = summary.failed > 0 ? 'failure' : 
                         summary.warnings > 0 ? 'warning' : 'success';

    return {
      timestamp: new Date(),
      status: overallStatus,
      results,
      summary,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
    };
  }

  // Helper methods

  /**
   * Recursively get all files in a directory
   * @param {string} dirPath - Directory path
   * @returns {Promise<Array>} Array of file paths
   */
  async getFilesRecursively(dirPath) {
    const files = [];
    
    async function traverse(currentPath) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }
    
    await traverse(dirPath);
    return files;
  }

  /**
   * Get asset type from file extension
   * @param {string} ext - File extension
   * @returns {string} Asset type
   */
  getAssetType(ext) {
    const typeMap = {
      '.js': 'javascript',
      '.mjs': 'javascript',
      '.css': 'stylesheet',
      '.html': 'html',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.woff': 'font',
      '.woff2': 'font',
      '.ttf': 'font',
      '.eot': 'font'
    };
    
    return typeMap[ext] || 'other';
  }

  /**
   * Check if file appears to be optimized
   * @param {string} filePath - File path
   * @param {string} ext - File extension
   * @returns {boolean} Whether file appears optimized
   */
  isOptimized(filePath, ext) {
    const fileName = path.basename(filePath);
    
    // Check for minification indicators
    if (['.js', '.css'].includes(ext)) {
      return fileName.includes('.min.') || fileName.includes('-min.');
    }
    
    return true; // Assume other files are optimized
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = BuildValidationService;