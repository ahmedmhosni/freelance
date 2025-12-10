/**
 * Health Check Service
 * Orchestrates comprehensive system validation checks within the DI container
 */

const BaseService = require('../../../shared/base/BaseService');
const FileSystemValidator = require('../validators/FileSystemValidator');
const EnvironmentValidator = require('../validators/EnvironmentValidator');
const DependencyValidator = require('../validators/DependencyValidator');
const DatabaseValidator = require('../validators/DatabaseValidator');
const SecurityValidator = require('../validators/SecurityValidator');

class HealthCheckService extends BaseService {
  constructor(database, logger, config, healthCheckRepository) {
    super(healthCheckRepository);
    this.database = database;
    this.logger = logger;
    this.config = config;
    
    // Initialize validators
    this.fileSystemValidator = new FileSystemValidator(logger);
    this.environmentValidator = new EnvironmentValidator(logger);
    this.dependencyValidator = new DependencyValidator(logger);
    this.databaseValidator = new DatabaseValidator(database, logger);
    this.securityValidator = new SecurityValidator(logger);
  }

  /**
   * Run comprehensive system check
   * @param {Object} options - Check options
   * @returns {Promise<Object>} Health check results
   */
  async runSystemCheck(options = {}) {
    const startTime = Date.now();
    const checks = [];

    try {
      this.logger.info('Starting comprehensive system health check', { options });

      // Run all validation checks using the new validators
      const fileStructureResult = await this.fileSystemValidator.validateStructure(
        options.requiredPaths, 
        options
      );
      checks.push(fileStructureResult);

      const envConfigResult = await this.environmentValidator.validateEnvironment(
        options.environment || 'development', 
        options
      );
      checks.push(envConfigResult);

      const dependenciesResult = await this.dependencyValidator.validateDependencies(
        options.projectPath || '.', 
        options
      );
      checks.push(dependenciesResult);

      const dbConnectivityResult = await this.databaseValidator.validateDatabase(options);
      checks.push(dbConnectivityResult);

      const securityConfigResult = await this.securityValidator.validateSecurity(options);
      checks.push(securityConfigResult);

      // Generate comprehensive report
      const report = this.generateHealthReport(checks, startTime);

      // Save results to database
      if (this.repository) {
        try {
          await this.repository.create({
            timestamp: new Date(),
            environment: options.environment || 'development',
            overall_status: report.overallStatus,
            checks: JSON.stringify(checks),
            summary: JSON.stringify(report.summary),
            duration: report.duration
          });
        } catch (dbError) {
          this.logger.warn('Failed to save health check results to database', dbError);
        }
      }

      this.logger.info('System health check completed', { 
        status: report.overallStatus,
        duration: report.duration 
      });

      return report;
    } catch (error) {
      this.logger.error('System health check failed', error);
      throw error;
    }
  }

  /**
   * Validate file structure and required paths
   * @param {Array} requiredPaths - Array of required file/directory paths
   * @returns {Promise<Object>} Validation result
   */
  async validateFileStructure(requiredPaths = []) {
    return await this.fileSystemValidator.validateStructure(requiredPaths);
  }

  /**
   * Check environment configuration
   * @param {string} environment - Target environment
   * @returns {Promise<Object>} Validation result
   */
  async checkEnvironmentConfig(environment = 'development') {
    return await this.environmentValidator.validateEnvironment(environment);
  }

  /**
   * Validate dependencies
   * @param {string} packagePath - Path to package.json
   * @returns {Promise<Object>} Validation result
   */
  async validateDependencies(packagePath = '.') {
    return await this.dependencyValidator.validateDependencies(packagePath);
  }

  /**
   * Test database connectivity
   * @returns {Promise<Object>} Validation result
   */
  async testDatabaseConnectivity() {
    return await this.databaseValidator.validateDatabase();
  }

  /**
   * Validate security configuration
   * @returns {Promise<Object>} Validation result
   */
  async validateSecurityConfig() {
    return await this.securityValidator.validateSecurity();
  }

  /**
   * Generate comprehensive health report
   * @param {Array} checks - Array of check results
   * @param {number} startTime - Start timestamp
   * @returns {Object} Health report
   */
  generateHealthReport(checks, startTime) {
    const duration = Date.now() - startTime;
    
    const summary = {
      total: checks.length,
      passed: checks.filter(c => c.status === 'pass').length,
      failed: checks.filter(c => c.status === 'fail').length,
      warnings: checks.filter(c => c.status === 'warning').length
    };

    const overallStatus = summary.failed > 0 ? 'fail' : 
                         summary.warnings > 0 ? 'warning' : 'pass';

    return {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      overallStatus,
      checks,
      summary,
      duration
    };
  }
}

module.exports = HealthCheckService;