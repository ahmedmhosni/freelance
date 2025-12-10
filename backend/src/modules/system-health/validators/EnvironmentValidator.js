/**
 * Environment Configuration Validator
 * Validates environment variables, configuration files, and environment-specific settings
 */

const fs = require('fs').promises;
const path = require('path');

class EnvironmentValidator {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Validate environment configuration for a specific environment
   * @param {string} environment - Target environment (development, staging, production, test)
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateEnvironment(environment = 'development', options = {}) {
    const startTime = Date.now();
    
    try {
      this.logger?.debug('Starting environment validation', { environment, options });

      const results = [];
      
      // Validate required environment variables
      const envVarResult = await this.validateEnvironmentVariables(environment, options);
      results.push(envVarResult);

      // Validate configuration files
      const configFileResult = await this.validateConfigurationFiles(environment, options);
      results.push(configFileResult);

      // Validate environment-specific settings
      const settingsResult = await this.validateEnvironmentSettings(environment, options);
      results.push(settingsResult);

      // Determine overall status
      const failedResults = results.filter(r => r.status === 'fail');
      const warningResults = results.filter(r => r.status === 'warning');
      
      const overallStatus = failedResults.length > 0 ? 'fail' : 
                           warningResults.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Environment Configuration Validation',
        status: overallStatus,
        message: this.generateEnvironmentMessage(overallStatus, results),
        details: {
          environment,
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
      this.logger?.error('Environment validation failed', error);
      
      return {
        name: 'Environment Configuration Validation',
        status: 'fail',
        message: `Environment validation failed: ${error.message}`,
        details: { error: error.message, environment },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate required environment variables
   * @param {string} environment - Target environment
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateEnvironmentVariables(environment, options = {}) {
    const startTime = Date.now();
    
    try {
      const requiredVars = this.getRequiredEnvironmentVariables(environment);
      const customVars = options.requiredVariables || [];
      const allRequiredVars = [...requiredVars, ...customVars];

      const results = [];
      const missingVars = [];
      const invalidVars = [];

      for (const varName of allRequiredVars) {
        const value = process.env[varName];
        const result = {
          name: varName,
          present: !!value,
          value: value ? '[REDACTED]' : undefined,
          valid: true
        };

        if (!value) {
          missingVars.push(varName);
          result.valid = false;
        } else {
          // Validate specific variables
          const validation = this.validateSpecificVariable(varName, value);
          if (!validation.valid) {
            invalidVars.push({ name: varName, reason: validation.reason });
            result.valid = false;
            result.validationError = validation.reason;
          }
        }

        results.push(result);
      }

      const status = missingVars.length > 0 || invalidVars.length > 0 ? 'fail' : 'pass';

      return {
        name: 'Environment Variables',
        status,
        message: status === 'pass'
          ? `All ${allRequiredVars.length} required environment variables present and valid`
          : `${missingVars.length} missing, ${invalidVars.length} invalid variables`,
        details: {
          requiredCount: allRequiredVars.length,
          presentCount: results.filter(r => r.present).length,
          validCount: results.filter(r => r.valid).length,
          missingVars,
          invalidVars,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Environment Variables',
        status: 'fail',
        message: `Environment variable validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate configuration files
   * @param {string} environment - Target environment
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateConfigurationFiles(environment, options = {}) {
    const startTime = Date.now();
    
    try {
      const configFiles = this.getRequiredConfigFiles(environment);
      const customFiles = options.configFiles || [];
      const allConfigFiles = [...configFiles, ...customFiles];

      const results = [];
      const missingFiles = [];
      const invalidFiles = [];

      for (const configFile of allConfigFiles) {
        try {
          await fs.access(configFile.path);
          
          const result = {
            path: configFile.path,
            exists: true,
            type: configFile.type,
            valid: true
          };

          // Validate file content if it's a JSON file
          if (configFile.type === 'json') {
            try {
              const content = await fs.readFile(configFile.path, 'utf8');
              JSON.parse(content);
              result.contentValid = true;
            } catch (parseError) {
              result.contentValid = false;
              result.parseError = parseError.message;
              invalidFiles.push({ path: configFile.path, reason: 'Invalid JSON' });
              result.valid = false;
            }
          }

          // Validate required properties if specified
          if (configFile.requiredProperties && result.contentValid !== false) {
            const validation = await this.validateConfigProperties(configFile);
            if (!validation.valid) {
              invalidFiles.push({ path: configFile.path, reason: validation.reason });
              result.valid = false;
              result.propertyValidation = validation;
            }
          }

          results.push(result);
        } catch (error) {
          missingFiles.push(configFile.path);
          results.push({
            path: configFile.path,
            exists: false,
            type: configFile.type,
            valid: false,
            error: error.message
          });
        }
      }

      const status = missingFiles.length > 0 || invalidFiles.length > 0 ? 'fail' : 'pass';

      return {
        name: 'Configuration Files',
        status,
        message: status === 'pass'
          ? `All ${allConfigFiles.length} configuration files present and valid`
          : `${missingFiles.length} missing, ${invalidFiles.length} invalid files`,
        details: {
          totalFiles: allConfigFiles.length,
          existingFiles: results.filter(r => r.exists).length,
          validFiles: results.filter(r => r.valid).length,
          missingFiles,
          invalidFiles,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Configuration Files',
        status: 'fail',
        message: `Configuration file validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate environment-specific settings
   * @param {string} environment - Target environment
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateEnvironmentSettings(environment, options = {}) {
    const startTime = Date.now();
    
    try {
      const checks = [];
      const warnings = [];

      // Check NODE_ENV consistency
      const nodeEnv = process.env.NODE_ENV;
      if (nodeEnv && nodeEnv !== environment) {
        warnings.push(`NODE_ENV (${nodeEnv}) doesn't match target environment (${environment})`);
      }

      // Environment-specific validations
      if (environment === 'production') {
        checks.push(...this.getProductionChecks());
      } else if (environment === 'development') {
        checks.push(...this.getDevelopmentChecks());
      }

      // Run custom checks if provided
      if (options.customChecks) {
        checks.push(...options.customChecks);
      }

      const checkResults = [];
      for (const check of checks) {
        try {
          const result = await this.runEnvironmentCheck(check);
          checkResults.push(result);
          
          if (!result.passed && result.severity === 'error') {
            warnings.push(result.message);
          }
        } catch (error) {
          checkResults.push({
            name: check.name,
            passed: false,
            severity: 'error',
            message: `Check failed: ${error.message}`
          });
        }
      }

      const failedChecks = checkResults.filter(c => !c.passed && c.severity === 'error');
      const warningChecks = checkResults.filter(c => !c.passed && c.severity === 'warning');

      const status = failedChecks.length > 0 ? 'fail' : 
                   warningChecks.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Environment Settings',
        status,
        message: status === 'pass'
          ? `All environment settings validated for ${environment}`
          : `${failedChecks.length} failed checks, ${warningChecks.length} warnings`,
        details: {
          environment,
          nodeEnv,
          totalChecks: checkResults.length,
          passedChecks: checkResults.filter(c => c.passed).length,
          failedChecks: failedChecks.length,
          warningChecks: warningChecks.length,
          warnings,
          checkResults
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Environment Settings',
        status: 'fail',
        message: `Environment settings validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Get required environment variables for a specific environment
   * @param {string} environment - Target environment
   * @returns {Array} Array of required variable names
   */
  getRequiredEnvironmentVariables(environment) {
    const common = ['JWT_SECRET', 'PORT'];
    
    switch (environment) {
      case 'production':
        return [
          ...common,
          'DB_HOST', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD',
          'FRONTEND_URL', 'NODE_ENV'
        ];
      case 'development':
        return [
          ...common,
          'PG_HOST', 'PG_DATABASE', 'PG_USER', 'PG_PASSWORD'
        ];
      case 'test':
        return [
          ...common,
          'PG_HOST', 'PG_DATABASE', 'PG_USER'
        ];
      default:
        return common;
    }
  }

  /**
   * Get required configuration files for a specific environment
   * @param {string} environment - Target environment
   * @returns {Array} Array of required config file objects
   */
  getRequiredConfigFiles(environment) {
    const common = [
      { path: 'backend/package.json', type: 'json', requiredProperties: ['name', 'version', 'scripts'] },
      { path: 'frontend/package.json', type: 'json', requiredProperties: ['name', 'version', 'scripts'] }
    ];

    switch (environment) {
      case 'production':
        return [
          ...common,
          { path: 'frontend/.env.production', type: 'env', optional: true }
        ];
      case 'development':
        return [
          ...common,
          { path: 'backend/.env', type: 'env' },
          { path: 'frontend/.env', type: 'env' }
        ];
      default:
        return common;
    }
  }

  /**
   * Validate a specific environment variable
   * @param {string} name - Variable name
   * @param {string} value - Variable value
   * @returns {Object} Validation result
   */
  validateSpecificVariable(name, value) {
    switch (name) {
      case 'JWT_SECRET':
        if (value.length < 32) {
          return { valid: false, reason: 'JWT_SECRET should be at least 32 characters long' };
        }
        if (value.includes('change_this') || value.includes('your_secret')) {
          return { valid: false, reason: 'JWT_SECRET appears to be a default value' };
        }
        break;
      
      case 'PORT':
        const port = parseInt(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          return { valid: false, reason: 'PORT must be a valid port number (1-65535)' };
        }
        break;
      
      case 'NODE_ENV':
        const validNodeEnvs = ['development', 'production', 'test', 'staging'];
        if (!validNodeEnvs.includes(value)) {
          return { valid: false, reason: `NODE_ENV must be one of: ${validNodeEnvs.join(', ')}` };
        }
        break;
      
      case 'FRONTEND_URL':
      case 'APP_URL':
        try {
          new URL(value);
        } catch (error) {
          return { valid: false, reason: 'Must be a valid URL' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Validate configuration file properties
   * @param {Object} configFile - Configuration file object
   * @returns {Promise<Object>} Validation result
   */
  async validateConfigProperties(configFile) {
    try {
      const content = await fs.readFile(configFile.path, 'utf8');
      
      if (configFile.type === 'json') {
        const config = JSON.parse(content);
        const missingProperties = [];
        
        for (const prop of configFile.requiredProperties) {
          if (!(prop in config)) {
            missingProperties.push(prop);
          }
        }

        if (missingProperties.length > 0) {
          return {
            valid: false,
            reason: `Missing required properties: ${missingProperties.join(', ')}`
          };
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        reason: `Failed to validate properties: ${error.message}`
      };
    }
  }

  /**
   * Get production-specific checks
   * @returns {Array} Array of check objects
   */
  getProductionChecks() {
    return [
      {
        name: 'JWT Secret Security',
        check: () => {
          const secret = process.env.JWT_SECRET;
          return secret && secret.length >= 64 && !secret.includes('default');
        },
        severity: 'error',
        message: 'JWT secret should be long and secure for production'
      },
      {
        name: 'Debug Mode Disabled',
        check: () => {
          return process.env.DEBUG !== 'true' && process.env.LOG_LEVEL !== 'debug';
        },
        severity: 'warning',
        message: 'Debug mode should be disabled in production'
      }
    ];
  }

  /**
   * Get development-specific checks
   * @returns {Array} Array of check objects
   */
  getDevelopmentChecks() {
    return [
      {
        name: 'Development Database',
        check: () => {
          const host = process.env.PG_HOST;
          return host === 'localhost' || host === '127.0.0.1';
        },
        severity: 'warning',
        message: 'Development should use local database'
      }
    ];
  }

  /**
   * Run an environment check
   * @param {Object} check - Check object
   * @returns {Promise<Object>} Check result
   */
  async runEnvironmentCheck(check) {
    try {
      const passed = typeof check.check === 'function' ? await check.check() : false;
      
      return {
        name: check.name,
        passed,
        severity: check.severity || 'error',
        message: passed ? `${check.name} passed` : (check.message || `${check.name} failed`)
      };
    } catch (error) {
      return {
        name: check.name,
        passed: false,
        severity: 'error',
        message: `Check failed: ${error.message}`
      };
    }
  }

  /**
   * Generate environment validation message
   * @param {string} status - Overall status
   * @param {Array} results - Validation results
   * @returns {string} Status message
   */
  generateEnvironmentMessage(status, results) {
    const totalChecks = results.length;
    const passedChecks = results.filter(r => r.status === 'pass').length;
    const failedChecks = results.filter(r => r.status === 'fail').length;
    const warningChecks = results.filter(r => r.status === 'warning').length;

    if (status === 'pass') {
      return `All ${totalChecks} environment checks passed`;
    } else if (status === 'warning') {
      return `${passedChecks}/${totalChecks} checks passed, ${warningChecks} warnings`;
    } else {
      return `${failedChecks}/${totalChecks} checks failed, ${warningChecks} warnings`;
    }
  }
}

module.exports = EnvironmentValidator;