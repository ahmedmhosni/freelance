/**
 * Configuration Loader
 * 
 * Loads and validates audit configuration from various sources:
 * - Default configuration (audit.config.js)
 * - Environment-specific configuration files
 * - Environment variables
 * - Command-line overrides
 * 
 * Requirements: 10.1, 10.3, 10.5
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Configuration validation errors
 */
class ConfigValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ConfigValidationError';
    this.errors = errors;
  }
}

/**
 * Configuration Loader class
 */
class ConfigLoader {
  /**
   * Creates a new ConfigLoader instance
   * @param {Object} options - Loader options
   * @param {string} [options.configPath] - Path to configuration file
   * @param {string} [options.environment] - Environment name (development, production, test)
   */
  constructor(options = {}) {
    this.options = options;
    this.configPath = options.configPath || null;
    this.environment = options.environment || process.env.NODE_ENV || 'development';
    this.validationErrors = [];
  }

  /**
   * Loads configuration from all sources
   * @returns {Object} Merged configuration
   */
  load() {
    logger.info('Loading audit configuration', {
      environment: this.environment,
      configPath: this.configPath
    });

    // Start with default configuration
    const defaultConfig = this._loadDefaultConfig();

    // Load environment-specific configuration
    const envConfig = this._loadEnvironmentConfig();

    // Load custom configuration file if specified
    const customConfig = this.configPath ? this._loadCustomConfig(this.configPath) : {};

    // Merge configurations (later sources override earlier ones)
    const mergedConfig = this._mergeConfigs(defaultConfig, envConfig, customConfig);

    // Apply environment variable overrides
    const finalConfig = this._applyEnvironmentOverrides(mergedConfig);

    // Validate configuration
    this._validateConfiguration(finalConfig);

    if (this.validationErrors.length > 0) {
      throw new ConfigValidationError(
        'Configuration validation failed',
        this.validationErrors
      );
    }

    logger.info('Configuration loaded successfully', {
      environment: this.environment,
      modulesPath: finalConfig.backend.modulesPath,
      databaseHost: finalConfig.database.host
    });

    return finalConfig;
  }

  /**
   * Loads default configuration
   * @returns {Object} Default configuration
   * @private
   */
  _loadDefaultConfig() {
    try {
      const defaultConfigPath = path.resolve(__dirname, '../audit.config.js');
      return require(defaultConfigPath);
    } catch (error) {
      logger.error('Failed to load default configuration', { error: error.message });
      throw new Error(`Failed to load default configuration: ${error.message}`);
    }
  }

  /**
   * Loads environment-specific configuration
   * @returns {Object} Environment configuration
   * @private
   */
  _loadEnvironmentConfig() {
    const envConfigPath = path.resolve(
      __dirname,
      `../audit.config.${this.environment}.js`
    );

    if (fs.existsSync(envConfigPath)) {
      try {
        logger.info('Loading environment-specific configuration', {
          path: envConfigPath
        });
        return require(envConfigPath);
      } catch (error) {
        logger.warn('Failed to load environment configuration', {
          path: envConfigPath,
          error: error.message
        });
      }
    }

    return {};
  }

  /**
   * Loads custom configuration file
   * @param {string} configPath - Path to configuration file
   * @returns {Object} Custom configuration
   * @private
   */
  _loadCustomConfig(configPath) {
    const resolvedPath = path.resolve(configPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Configuration file not found: ${resolvedPath}`);
    }

    try {
      logger.info('Loading custom configuration', { path: resolvedPath });
      return require(resolvedPath);
    } catch (error) {
      throw new Error(`Failed to load custom configuration: ${error.message}`);
    }
  }

  /**
   * Merges multiple configuration objects
   * @param {...Object} configs - Configuration objects to merge
   * @returns {Object} Merged configuration
   * @private
   */
  _mergeConfigs(...configs) {
    return configs.reduce((merged, config) => {
      return this._deepMerge(merged, config);
    }, {});
  }

  /**
   * Deep merges two objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   * @private
   */
  _deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          result[key] = this._deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Applies environment variable overrides to configuration
   * @param {Object} config - Base configuration
   * @returns {Object} Configuration with environment overrides
   * @private
   */
  _applyEnvironmentOverrides(config) {
    const result = { ...config };

    // Backend overrides
    if (process.env.AUDIT_BACKEND_PORT) {
      result.backend.port = parseInt(process.env.AUDIT_BACKEND_PORT, 10);
    }
    if (process.env.AUDIT_BACKEND_BASE_URL) {
      result.backend.baseURL = process.env.AUDIT_BACKEND_BASE_URL;
    }

    // Database overrides
    if (process.env.AUDIT_DB_HOST) {
      result.database.host = process.env.AUDIT_DB_HOST;
    }
    if (process.env.AUDIT_DB_PORT) {
      result.database.port = parseInt(process.env.AUDIT_DB_PORT, 10);
    }
    if (process.env.AUDIT_DB_NAME) {
      result.database.database = process.env.AUDIT_DB_NAME;
    }
    if (process.env.AUDIT_DB_USER) {
      result.database.user = process.env.AUDIT_DB_USER;
    }
    if (process.env.AUDIT_DB_PASSWORD) {
      result.database.password = process.env.AUDIT_DB_PASSWORD;
    }

    // Verification overrides
    if (process.env.AUDIT_TIMEOUT) {
      result.verification.timeout = parseInt(process.env.AUDIT_TIMEOUT, 10);
    }
    if (process.env.AUDIT_RETRIES) {
      result.verification.retries = parseInt(process.env.AUDIT_RETRIES, 10);
    }

    // Reporting overrides
    if (process.env.AUDIT_OUTPUT_PATH) {
      result.reporting.outputPath = process.env.AUDIT_OUTPUT_PATH;
    }
    if (process.env.AUDIT_OUTPUT_FORMAT) {
      result.reporting.format = process.env.AUDIT_OUTPUT_FORMAT;
    }

    return result;
  }

  /**
   * Validates configuration
   * @param {Object} config - Configuration to validate
   * @private
   */
  _validateConfiguration(config) {
    this.validationErrors = [];

    // Validate required environment variables
    this._validateEnvironmentVariables(config);

    // Validate backend configuration
    this._validateBackendConfig(config.backend);

    // Validate frontend configuration
    this._validateFrontendConfig(config.frontend);

    // Validate database configuration
    this._validateDatabaseConfig(config.database);

    // Validate verification configuration
    this._validateVerificationConfig(config.verification);

    // Validate reporting configuration
    this._validateReportingConfig(config.reporting);

    // Validate security configuration
    this._validateSecurityConfig(config.security);

    // Validate API URLs
    this._validateAPIURLs(config);
  }

  /**
   * Validates required environment variables
   * @param {Object} config - Configuration object
   * @private
   */
  _validateEnvironmentVariables(config) {
    const requiredEnvVars = [];

    // Check for production-specific requirements
    if (this.environment === 'production') {
      requiredEnvVars.push(
        'JWT_SECRET',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD'
      );
    }

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar] || process.env[envVar].trim() === '') {
        this.validationErrors.push({
          field: `env.${envVar}`,
          message: `Required environment variable ${envVar} is not set`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validates backend configuration
   * @param {Object} backendConfig - Backend configuration
   * @private
   */
  _validateBackendConfig(backendConfig) {
    if (!backendConfig) {
      this.validationErrors.push({
        field: 'backend',
        message: 'Backend configuration is required',
        severity: 'error'
      });
      return;
    }

    // Validate paths exist
    if (backendConfig.modulesPath && !fs.existsSync(backendConfig.modulesPath)) {
      this.validationErrors.push({
        field: 'backend.modulesPath',
        message: `Modules path does not exist: ${backendConfig.modulesPath}`,
        severity: 'warning'
      });
    }

    if (backendConfig.routesPath && !fs.existsSync(backendConfig.routesPath)) {
      this.validationErrors.push({
        field: 'backend.routesPath',
        message: `Routes path does not exist: ${backendConfig.routesPath}`,
        severity: 'warning'
      });
    }

    // Validate port
    if (backendConfig.port && (backendConfig.port < 1 || backendConfig.port > 65535)) {
      this.validationErrors.push({
        field: 'backend.port',
        message: `Invalid port number: ${backendConfig.port}`,
        severity: 'error'
      });
    }
  }

  /**
   * Validates frontend configuration
   * @param {Object} frontendConfig - Frontend configuration
   * @private
   */
  _validateFrontendConfig(frontendConfig) {
    if (!frontendConfig) {
      this.validationErrors.push({
        field: 'frontend',
        message: 'Frontend configuration is required',
        severity: 'error'
      });
      return;
    }

    // Validate paths exist
    if (frontendConfig.srcPath && !fs.existsSync(frontendConfig.srcPath)) {
      this.validationErrors.push({
        field: 'frontend.srcPath',
        message: `Frontend source path does not exist: ${frontendConfig.srcPath}`,
        severity: 'warning'
      });
    }
  }

  /**
   * Validates database configuration
   * @param {Object} dbConfig - Database configuration
   * @private
   */
  _validateDatabaseConfig(dbConfig) {
    if (!dbConfig) {
      this.validationErrors.push({
        field: 'database',
        message: 'Database configuration is required',
        severity: 'error'
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['host', 'port', 'database', 'user'];
    for (const field of requiredFields) {
      if (!dbConfig[field]) {
        this.validationErrors.push({
          field: `database.${field}`,
          message: `Database ${field} is required`,
          severity: 'error'
        });
      }
    }

    // Validate port
    if (dbConfig.port && (dbConfig.port < 1 || dbConfig.port > 65535)) {
      this.validationErrors.push({
        field: 'database.port',
        message: `Invalid database port: ${dbConfig.port}`,
        severity: 'error'
      });
    }
  }

  /**
   * Validates verification configuration
   * @param {Object} verificationConfig - Verification configuration
   * @private
   */
  _validateVerificationConfig(verificationConfig) {
    if (!verificationConfig) {
      this.validationErrors.push({
        field: 'verification',
        message: 'Verification configuration is required',
        severity: 'error'
      });
      return;
    }

    // Validate timeout
    if (verificationConfig.timeout && verificationConfig.timeout < 100) {
      this.validationErrors.push({
        field: 'verification.timeout',
        message: 'Timeout must be at least 100ms',
        severity: 'warning'
      });
    }

    // Validate retries
    if (verificationConfig.retries && verificationConfig.retries < 0) {
      this.validationErrors.push({
        field: 'verification.retries',
        message: 'Retries must be non-negative',
        severity: 'error'
      });
    }
  }

  /**
   * Validates reporting configuration
   * @param {Object} reportingConfig - Reporting configuration
   * @private
   */
  _validateReportingConfig(reportingConfig) {
    if (!reportingConfig) {
      this.validationErrors.push({
        field: 'reporting',
        message: 'Reporting configuration is required',
        severity: 'error'
      });
      return;
    }

    // Validate output format
    const validFormats = ['markdown', 'json', 'html'];
    if (reportingConfig.format && !validFormats.includes(reportingConfig.format)) {
      this.validationErrors.push({
        field: 'reporting.format',
        message: `Invalid output format: ${reportingConfig.format}. Must be one of: ${validFormats.join(', ')}`,
        severity: 'error'
      });
    }
  }

  /**
   * Validates security configuration
   * @param {Object} securityConfig - Security configuration
   * @private
   */
  _validateSecurityConfig(securityConfig) {
    if (!securityConfig) {
      this.validationErrors.push({
        field: 'security',
        message: 'Security configuration is required',
        severity: 'error'
      });
      return;
    }

    // In production, ensure security features are enabled
    if (this.environment === 'production') {
      // Check JWT secret from environment variable or config
      const jwtSecret = process.env.JWT_SECRET || securityConfig.jwtSecret;
      
      if (!jwtSecret || jwtSecret.length < 20 || jwtSecret === 'test-secret-key') {
        this.validationErrors.push({
          field: 'security.jwtSecret',
          message: 'Production environment requires a secure JWT secret (minimum 20 characters)',
          severity: 'error'
        });
      }

      if (securityConfig.rejectUnauthorized === false) {
        this.validationErrors.push({
          field: 'security.rejectUnauthorized',
          message: 'SSL verification should be enabled in production',
          severity: 'warning'
        });
      }
    }
  }

  /**
   * Validates API URLs
   * @param {Object} config - Configuration object
   * @private
   */
  _validateAPIURLs(config) {
    // Validate backend base URL
    if (config.backend.baseURL) {
      if (!this._isValidURL(config.backend.baseURL)) {
        this.validationErrors.push({
          field: 'backend.baseURL',
          message: `Invalid backend base URL: ${config.backend.baseURL}`,
          severity: 'error'
        });
      }
    }

    // Validate frontend base URL
    if (config.frontend.baseURL) {
      if (!this._isValidURL(config.frontend.baseURL)) {
        this.validationErrors.push({
          field: 'frontend.baseURL',
          message: `Invalid frontend base URL: ${config.frontend.baseURL}`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * Checks if a string is a valid URL
   * @param {string} urlString - URL string to validate
   * @returns {boolean} True if valid URL
   * @private
   */
  _isValidURL(urlString) {
    try {
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets validation errors
   * @returns {Array<Object>} Validation errors
   */
  getValidationErrors() {
    return this.validationErrors;
  }

  /**
   * Gets validation errors by severity
   * @param {string} severity - Severity level (error, warning)
   * @returns {Array<Object>} Filtered validation errors
   */
  getValidationErrorsBySeverity(severity) {
    return this.validationErrors.filter(error => error.severity === severity);
  }

  /**
   * Checks if configuration has errors
   * @returns {boolean} True if errors exist
   */
  hasErrors() {
    return this.getValidationErrorsBySeverity('error').length > 0;
  }

  /**
   * Checks if configuration has warnings
   * @returns {boolean} True if warnings exist
   */
  hasWarnings() {
    return this.getValidationErrorsBySeverity('warning').length > 0;
  }
}

module.exports = ConfigLoader;
module.exports.ConfigValidationError = ConfigValidationError;
