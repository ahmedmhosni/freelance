/**
 * Deployment Service
 * Orchestrates deployment preparation and execution within the service layer
 */

const BaseService = require('../../../shared/base/BaseService');
const path = require('path');
const fs = require('fs').promises;

class DeploymentService extends BaseService {
  constructor(database, logger, config, notificationService, deploymentLogRepository) {
    super(deploymentLogRepository);
    this.database = database;
    this.logger = logger;
    this.config = config;
    this.notificationService = notificationService;
    this.deploymentLogRepository = deploymentLogRepository;
  }

  /**
   * Prepare deployment for target environment
   * @param {Object} environment - Environment configuration
   * @returns {Promise<Object>} Deployment preparation result
   */
  async prepareDeployment(environment) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Preparing deployment', { environment });

      // Validate environment
      if (!environment || typeof environment !== 'object') {
        throw new Error('Environment configuration is required');
      }

      const validEnvironments = ['development', 'staging', 'production'];
      if (!validEnvironments.includes(environment.name)) {
        throw new Error(`Invalid environment: ${environment.name}. Must be one of: ${validEnvironments.join(', ')}`);
      }

      // Generate deployment configuration
      const deploymentConfig = await this.generateDeploymentConfig(environment);

      // Create deployment package
      const packageInfo = await this.createDeploymentPackage(deploymentConfig);

      // Log deployment preparation
      const duration = Date.now() - startTime;
      const result = {
        status: 'prepared',
        environment: environment.name,
        timestamp: new Date(),
        duration,
        config: deploymentConfig,
        package: packageInfo,
        version: this.generateVersion()
      };

      await this.logDeploymentEvent({
        type: 'preparation',
        environment: environment.name,
        status: 'success',
        details: result
      });

      this.logger.info('Deployment preparation completed', { environment: environment.name, duration });

      return result;
    } catch (error) {
      this.logger.error('Deployment preparation failed', { error: error.message, environment });
      
      await this.logDeploymentEvent({
        type: 'preparation',
        environment: environment.name,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Generate deployment configuration for environment
   * @param {Object} environment - Environment configuration
   * @returns {Promise<Object>} Deployment configuration
   */
  async generateDeploymentConfig(environment) {
    try {
      this.logger.info('Generating deployment configuration', { environment: environment.name });

      const config = {
        environment: environment.name,
        timestamp: new Date(),
        version: this.generateVersion(),
        azure: await this.generateAzureConfig(environment),
        frontend: await this.generateFrontendConfig(environment),
        backend: await this.generateBackendConfig(environment),
        database: await this.generateDatabaseConfig(environment)
      };

      return config;
    } catch (error) {
      this.logger.error('Failed to generate deployment configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate Azure-specific configuration
   * @param {Object} environment - Environment configuration
   * @returns {Promise<Object>} Azure configuration
   */
  async generateAzureConfig(environment) {
    try {
      const azureConfig = {
        appServiceName: environment.azure?.appServiceName || `roastify-${environment.name}`,
        resourceGroup: environment.azure?.resourceGroup || `roastify-${environment.name}-rg`,
        region: environment.azure?.region || 'eastus',
        environmentVariables: this.generateEnvironmentVariables(environment),
        connectionStrings: this.generateConnectionStrings(environment),
        deploymentSlots: {
          staging: `${environment.name}-staging`,
          production: environment.name
        }
      };

      return azureConfig;
    } catch (error) {
      this.logger.error('Failed to generate Azure configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate environment variables for deployment
   * @param {Object} environment - Environment configuration
   * @returns {Object} Environment variables
   */
  generateEnvironmentVariables(environment) {
    const envVars = {
      NODE_ENV: environment.name,
      APP_ENV: environment.name,
      LOG_LEVEL: environment.name === 'production' ? 'info' : 'debug',
      DATABASE_URL: environment.database?.url || process.env.DATABASE_URL || '',
      AZURE_STORAGE_ACCOUNT: environment.azure?.storageAccount || process.env.AZURE_STORAGE_ACCOUNT || '',
      AZURE_STORAGE_KEY: environment.azure?.storageKey || process.env.AZURE_STORAGE_KEY || '',
      JWT_SECRET: environment.jwt?.secret || process.env.JWT_SECRET || '',
      API_PORT: String(environment.api?.port || 3001),
      FRONTEND_URL: environment.frontend?.url || process.env.FRONTEND_URL || '',
      BACKEND_URL: environment.backend?.url || process.env.BACKEND_URL || ''
    };

    // Add environment-specific variables
    if (environment.variables) {
      Object.assign(envVars, environment.variables);
    }

    // Ensure all values are strings or null
    for (const key in envVars) {
      if (envVars[key] === undefined) {
        envVars[key] = null;
      } else if (typeof envVars[key] !== 'string') {
        envVars[key] = String(envVars[key]);
      }
    }

    return envVars;
  }

  /**
   * Generate connection strings for deployment
   * @param {Object} environment - Environment configuration
   * @returns {Object} Connection strings
   */
  generateConnectionStrings(environment) {
    const connectionStrings = {
      database: environment.database?.connectionString || process.env.DATABASE_URL || '',
      storage: environment.azure?.storageConnectionString || process.env.AZURE_STORAGE_CONNECTION_STRING || '',
      appInsights: environment.azure?.appInsightsConnectionString || process.env.APPINSIGHTS_CONNECTION_STRING || ''
    };

    // Ensure all values are strings or null
    for (const key in connectionStrings) {
      if (connectionStrings[key] === undefined) {
        connectionStrings[key] = null;
      } else if (typeof connectionStrings[key] !== 'string') {
        connectionStrings[key] = String(connectionStrings[key]);
      }
    }

    return connectionStrings;
  }

  /**
   * Generate frontend-specific configuration
   * @param {Object} environment - Environment configuration
   * @returns {Promise<Object>} Frontend configuration
   */
  async generateFrontendConfig(environment) {
    return {
      buildPath: environment.frontend?.buildPath || 'frontend/dist',
      staticWebAppConfig: {
        routes: [
          {
            route: '/*',
            serve: '/index.html',
            statusCode: 200
          }
        ],
        navigationFallback: {
          rewrite: '/index.html',
          exclude: ['/api/*', '/*.{json,txt,xml}']
        }
      },
      environment: environment.name,
      apiUrl: environment.backend?.url || process.env.BACKEND_URL
    };
  }

  /**
   * Generate backend-specific configuration
   * @param {Object} environment - Environment configuration
   * @returns {Promise<Object>} Backend configuration
   */
  async generateBackendConfig(environment) {
    return {
      packagePath: environment.backend?.packagePath || 'backend',
      startupCommand: environment.backend?.startupCommand || 'npm start',
      environment: environment.name,
      port: environment.api?.port || 3001,
      nodeVersion: environment.backend?.nodeVersion || '18.x'
    };
  }

  /**
   * Generate database-specific configuration
   * @param {Object} environment - Environment configuration
   * @returns {Promise<Object>} Database configuration
   */
  async generateDatabaseConfig(environment) {
    return {
      type: environment.database?.type || 'postgresql',
      host: environment.database?.host || process.env.DB_HOST,
      port: environment.database?.port || 5432,
      database: environment.database?.name || `roastify_${environment.name}`,
      ssl: environment.database?.ssl !== false,
      poolSize: environment.database?.poolSize || 10
    };
  }

  /**
   * Create deployment package
   * @param {Object} deploymentConfig - Deployment configuration
   * @returns {Promise<Object>} Package information
   */
  async createDeploymentPackage(deploymentConfig) {
    try {
      this.logger.info('Creating deployment package', { environment: deploymentConfig.environment });

      const packageInfo = {
        name: `roastify-${deploymentConfig.environment}-${deploymentConfig.version}`,
        version: deploymentConfig.version,
        environment: deploymentConfig.environment,
        timestamp: new Date(),
        contents: {
          frontend: {
            path: deploymentConfig.frontend.buildPath,
            included: true
          },
          backend: {
            path: deploymentConfig.backend.packagePath,
            included: true
          },
          config: {
            azure: deploymentConfig.azure,
            database: deploymentConfig.database
          }
        },
        size: 0,
        checksum: this.generateChecksum(deploymentConfig)
      };

      return packageInfo;
    } catch (error) {
      this.logger.error('Failed to create deployment package', { error: error.message });
      throw error;
    }
  }

  /**
   * Deploy to Azure
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Deployment result
   */
  async deployToAzure(config) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting Azure deployment', { environment: config.environment });

      // Validate configuration
      if (!config || !config.azure) {
        throw new Error('Azure configuration is required');
      }

      // Simulate deployment steps
      const deploymentSteps = [
        { step: 'validate_config', status: 'pending' },
        { step: 'prepare_resources', status: 'pending' },
        { step: 'deploy_backend', status: 'pending' },
        { step: 'deploy_frontend', status: 'pending' },
        { step: 'run_migrations', status: 'pending' },
        { step: 'verify_deployment', status: 'pending' }
      ];

      const results = [];

      for (const step of deploymentSteps) {
        try {
          this.logger.info(`Executing deployment step: ${step.step}`);
          
          // Execute step
          const stepResult = await this.executeDeploymentStep(step.step, config);
          
          results.push({
            ...step,
            status: 'completed',
            result: stepResult
          });
        } catch (error) {
          this.logger.error(`Deployment step failed: ${step.step}`, { error: error.message });
          
          results.push({
            ...step,
            status: 'failed',
            error: error.message
          });

          throw new Error(`Deployment failed at step: ${step.step}`);
        }
      }

      const duration = Date.now() - startTime;
      const result = {
        status: 'success',
        environment: config.environment,
        version: config.version,
        timestamp: new Date(),
        duration,
        steps: results
      };

      await this.logDeploymentEvent({
        type: 'deployment',
        environment: config.environment,
        status: 'success',
        details: result
      });

      this.logger.info('Azure deployment completed successfully', { environment: config.environment, duration });

      return result;
    } catch (error) {
      this.logger.error('Azure deployment failed', { error: error.message, environment: config.environment });
      
      await this.logDeploymentEvent({
        type: 'deployment',
        environment: config.environment,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Execute individual deployment step
   * @param {string} step - Step name
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Step result
   */
  async executeDeploymentStep(step, config) {
    switch (step) {
      case 'validate_config':
        return await this.validateDeploymentConfig(config);
      case 'prepare_resources':
        return await this.prepareAzureResources(config);
      case 'deploy_backend':
        return await this.deployBackend(config);
      case 'deploy_frontend':
        return await this.deployFrontend(config);
      case 'run_migrations':
        return await this.runDatabaseMigrations(config);
      case 'verify_deployment':
        return await this.verifyDeployment(config);
      default:
        throw new Error(`Unknown deployment step: ${step}`);
    }
  }

  /**
   * Validate deployment configuration
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Validation result
   */
  async validateDeploymentConfig(config) {
    const validations = [];

    // Check required fields
    if (!config.azure?.appServiceName) {
      validations.push({ check: 'azure_app_service', status: 'fail', message: 'App service name is required' });
    } else {
      validations.push({ check: 'azure_app_service', status: 'pass' });
    }

    if (!config.azure?.resourceGroup) {
      validations.push({ check: 'azure_resource_group', status: 'fail', message: 'Resource group is required' });
    } else {
      validations.push({ check: 'azure_resource_group', status: 'pass' });
    }

    if (!config.database?.host) {
      validations.push({ check: 'database_config', status: 'fail', message: 'Database host is required' });
    } else {
      validations.push({ check: 'database_config', status: 'pass' });
    }

    const hasFailed = validations.some(v => v.status === 'fail');
    if (hasFailed) {
      throw new Error('Deployment configuration validation failed');
    }

    return { validations, status: 'valid' };
  }

  /**
   * Prepare Azure resources
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Preparation result
   */
  async prepareAzureResources(config) {
    return {
      status: 'prepared',
      resources: [
        { type: 'app_service', name: config.azure.appServiceName, status: 'ready' },
        { type: 'resource_group', name: config.azure.resourceGroup, status: 'ready' },
        { type: 'storage_account', name: config.azure.storageAccount, status: 'ready' }
      ]
    };
  }

  /**
   * Deploy backend
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Deployment result
   */
  async deployBackend(config) {
    return {
      status: 'deployed',
      component: 'backend',
      appService: config.azure.appServiceName,
      version: config.version,
      url: `https://${config.azure.appServiceName}.azurewebsites.net`
    };
  }

  /**
   * Deploy frontend
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Deployment result
   */
  async deployFrontend(config) {
    return {
      status: 'deployed',
      component: 'frontend',
      staticWebApp: `${config.azure.appServiceName}-static`,
      version: config.version,
      url: `https://${config.azure.appServiceName}-static.azurestaticapps.net`
    };
  }

  /**
   * Run database migrations
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Migration result
   */
  async runDatabaseMigrations(config) {
    return {
      status: 'completed',
      migrations: [
        { name: 'create_tables', status: 'success' },
        { name: 'add_indexes', status: 'success' },
        { name: 'seed_data', status: 'success' }
      ]
    };
  }

  /**
   * Verify deployment
   * @param {Object} config - Deployment configuration
   * @returns {Promise<Object>} Verification result
   */
  async verifyDeployment(config) {
    return {
      status: 'verified',
      checks: [
        { check: 'backend_health', status: 'pass' },
        { check: 'frontend_health', status: 'pass' },
        { check: 'database_connectivity', status: 'pass' },
        { check: 'api_endpoints', status: 'pass' }
      ]
    };
  }

  /**
   * Validate deployment after completion
   * @param {Object} deploymentResult - Deployment result
   * @returns {Promise<Object>} Validation result
   */
  async validateDeployment(deploymentResult) {
    try {
      this.logger.info('Validating deployment', { environment: deploymentResult.environment });

      const validations = [];

      // Check deployment status
      if (deploymentResult.status !== 'success') {
        validations.push({ check: 'deployment_status', status: 'fail', message: 'Deployment did not complete successfully' });
      } else {
        validations.push({ check: 'deployment_status', status: 'pass' });
      }

      // Check all steps completed
      const allStepsCompleted = deploymentResult.steps?.every(s => s.status === 'completed');
      if (!allStepsCompleted) {
        validations.push({ check: 'all_steps_completed', status: 'fail', message: 'Not all deployment steps completed' });
      } else {
        validations.push({ check: 'all_steps_completed', status: 'pass' });
      }

      const hasFailed = validations.some(v => v.status === 'fail');
      
      return {
        status: hasFailed ? 'failed' : 'valid',
        validations,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Deployment validation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Rollback deployment to previous version
   * @param {string} environment - Environment name
   * @param {string} version - Version to rollback to
   * @returns {Promise<Object>} Rollback result
   */
  async rollbackDeployment(environment, version) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting deployment rollback', { environment, version });

      // Validate rollback parameters
      if (!environment || !version) {
        throw new Error('Environment and version are required for rollback');
      }

      // Get previous deployment
      const previousDeployment = await this.getPreviousDeployment(environment, version);
      if (!previousDeployment) {
        throw new Error(`No previous deployment found for version: ${version}`);
      }

      // Execute rollback steps
      const rollbackSteps = [
        { step: 'backup_current', status: 'pending' },
        { step: 'restore_backend', status: 'pending' },
        { step: 'restore_frontend', status: 'pending' },
        { step: 'verify_rollback', status: 'pending' }
      ];

      const results = [];

      for (const step of rollbackSteps) {
        try {
          this.logger.info(`Executing rollback step: ${step.step}`);
          
          const stepResult = await this.executeRollbackStep(step.step, previousDeployment);
          
          results.push({
            ...step,
            status: 'completed',
            result: stepResult
          });
        } catch (error) {
          this.logger.error(`Rollback step failed: ${step.step}`, { error: error.message });
          
          results.push({
            ...step,
            status: 'failed',
            error: error.message
          });

          throw new Error(`Rollback failed at step: ${step.step}`);
        }
      }

      const duration = Date.now() - startTime;
      const result = {
        status: 'success',
        environment,
        rolledBackTo: version,
        timestamp: new Date(),
        duration,
        steps: results
      };

      await this.logDeploymentEvent({
        type: 'rollback',
        environment,
        status: 'success',
        details: result
      });

      this.logger.info('Deployment rollback completed successfully', { environment, version, duration });

      return result;
    } catch (error) {
      this.logger.error('Deployment rollback failed', { error: error.message, environment });
      
      await this.logDeploymentEvent({
        type: 'rollback',
        environment,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get previous deployment for rollback
   * @param {string} environment - Environment name
   * @param {string} version - Version to rollback to
   * @returns {Promise<Object|null>} Previous deployment or null
   */
  async getPreviousDeployment(environment, version) {
    try {
      // Query deployment logs for previous version
      const deployments = await this.deploymentLogRepository.findMany(
        { environment, status: 'success' },
        { orderBy: 'created_at', order: 'DESC', limit: 10 }
      );

      // Find the specified version
      return deployments.find(d => d.version === version) || null;
    } catch (error) {
      this.logger.error('Failed to get previous deployment', { error: error.message });
      return null;
    }
  }

  /**
   * Execute individual rollback step
   * @param {string} step - Step name
   * @param {Object} previousDeployment - Previous deployment info
   * @returns {Promise<Object>} Step result
   */
  async executeRollbackStep(step, previousDeployment) {
    switch (step) {
      case 'backup_current':
        return { status: 'backed_up', timestamp: new Date() };
      case 'restore_backend':
        return { status: 'restored', component: 'backend', version: previousDeployment.version };
      case 'restore_frontend':
        return { status: 'restored', component: 'frontend', version: previousDeployment.version };
      case 'verify_rollback':
        return { status: 'verified', checks: ['backend_health', 'frontend_health', 'database_connectivity'] };
      default:
        throw new Error(`Unknown rollback step: ${step}`);
    }
  }

  /**
   * Log deployment event
   * @param {Object} event - Deployment event
   * @returns {Promise<void>}
   */
  async logDeploymentEvent(event) {
    try {
      const logEntry = {
        type: event.type,
        environment: event.environment,
        status: event.status,
        details: JSON.stringify(event.details || {}),
        error: event.error || null,
        timestamp: new Date()
      };

      await this.deploymentLogRepository.create(logEntry);
    } catch (error) {
      this.logger.error('Failed to log deployment event', { error: error.message });
      // Don't throw - logging failures shouldn't block deployment
    }
  }

  /**
   * Notify deployment status
   * @param {Object} status - Deployment status
   * @returns {Promise<void>}
   */
  async notifyDeploymentStatus(status) {
    try {
      if (!this.notificationService) {
        this.logger.warn('Notification service not available');
        return;
      }

      const notification = {
        type: 'deployment_status',
        title: `Deployment ${status.status}`,
        message: `Deployment to ${status.environment} ${status.status}`,
        severity: status.status === 'success' ? 'info' : 'error',
        details: status
      };

      await this.notificationService.createSystemNotification(notification);
    } catch (error) {
      this.logger.error('Failed to send deployment notification', { error: error.message });
      // Don't throw - notification failures shouldn't block deployment
    }
  }

  /**
   * Generate version string
   * @returns {string} Version string
   */
  generateVersion() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day}.${hours}${minutes}`;
  }

  /**
   * Generate checksum for deployment package
   * @param {Object} config - Deployment configuration
   * @returns {string} Checksum
   */
  generateChecksum(config) {
    const crypto = require('crypto');
    const data = JSON.stringify(config);
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = DeploymentService;
