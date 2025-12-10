/**
 * Deployment Configuration Model
 * Represents the structure and validation for deployment configurations
 */

class DeploymentConfig {
  constructor(data = {}) {
    this.id = data.id || null;
    this.environment = data.environment || 'development';
    this.timestamp = data.timestamp || new Date();
    this.version = data.version || '1.0.0';
    this.azure = data.azure || {};
    this.frontend = data.frontend || {};
    this.backend = data.backend || {};
    this.status = data.status || 'pending';
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  /**
   * Validate deployment configuration data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  static validate(data) {
    const errors = [];

    // Required fields
    if (!data.environment) {
      errors.push('environment is required');
    }

    if (!data.version) {
      errors.push('version is required');
    }

    // Validate environment values
    const validEnvironments = ['development', 'staging', 'production', 'test'];
    if (data.environment && !validEnvironments.includes(data.environment)) {
      errors.push(`environment must be one of: ${validEnvironments.join(', ')}`);
    }

    // Validate status values
    const validStatuses = ['pending', 'in_progress', 'completed', 'failed', 'rolled_back'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate version format (semantic versioning)
    if (data.version && !/^\d+\.\d+\.\d+(-[\w\.-]+)?$/.test(data.version)) {
      errors.push('version must follow semantic versioning format (e.g., 1.0.0)');
    }

    // Validate azure configuration
    if (data.azure && typeof data.azure !== 'object') {
      errors.push('azure configuration must be an object');
    }

    // Validate frontend configuration
    if (data.frontend && typeof data.frontend !== 'object') {
      errors.push('frontend configuration must be an object');
    }

    // Validate backend configuration
    if (data.backend && typeof data.backend !== 'object') {
      errors.push('backend configuration must be an object');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Create a new DeploymentConfig instance with validation
   * @param {Object} data - Deployment configuration data
   * @returns {DeploymentConfig} New instance
   */
  static create(data) {
    this.validate(data);
    return new DeploymentConfig(data);
  }

  /**
   * Create production deployment configuration
   * @param {Object} options - Configuration options
   * @returns {DeploymentConfig} Production configuration
   */
  static createProductionConfig(options = {}) {
    const config = {
      environment: 'production',
      version: options.version || '1.0.0',
      azure: {
        appServiceName: options.appServiceName || 'roastify-backend',
        resourceGroup: options.resourceGroup || 'roastify-rg',
        environmentVariables: options.environmentVariables || {},
        connectionStrings: options.connectionStrings || {}
      },
      frontend: {
        buildPath: options.frontendBuildPath || 'frontend/dist',
        staticWebAppConfig: options.staticWebAppConfig || {}
      },
      backend: {
        packagePath: options.backendPackagePath || 'backend',
        startupCommand: options.startupCommand || 'node src/server.js'
      },
      status: 'pending',
      timestamp: new Date()
    };

    return new DeploymentConfig(config);
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDatabase() {
    return {
      environment: this.environment,
      timestamp: this.timestamp,
      version: this.version,
      azure: typeof this.azure === 'string' ? this.azure : JSON.stringify(this.azure),
      frontend: typeof this.frontend === 'string' ? this.frontend : JSON.stringify(this.frontend),
      backend: typeof this.backend === 'string' ? this.backend : JSON.stringify(this.backend),
      status: this.status
    };
  }

  /**
   * Convert from database format
   * @param {Object} dbData - Database row data
   * @returns {DeploymentConfig} New instance
   */
  static fromDatabase(dbData) {
    const data = { ...dbData };
    
    // Parse JSON fields if they're strings
    const jsonFields = ['azure', 'frontend', 'backend'];
    
    jsonFields.forEach(field => {
      if (typeof data[field] === 'string') {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (error) {
          data[field] = {};
        }
      }
    });

    return new DeploymentConfig(data);
  }

  /**
   * Check if configuration is for production
   * @returns {boolean} True if production
   */
  isProduction() {
    return this.environment === 'production';
  }

  /**
   * Check if deployment is pending
   * @returns {boolean} True if pending
   */
  isPending() {
    return this.status === 'pending';
  }

  /**
   * Check if deployment is in progress
   * @returns {boolean} True if in progress
   */
  isInProgress() {
    return this.status === 'in_progress';
  }

  /**
   * Check if deployment is completed
   * @returns {boolean} True if completed
   */
  isCompleted() {
    return this.status === 'completed';
  }

  /**
   * Check if deployment failed
   * @returns {boolean} True if failed
   */
  isFailed() {
    return this.status === 'failed';
  }

  /**
   * Check if deployment was rolled back
   * @returns {boolean} True if rolled back
   */
  isRolledBack() {
    return this.status === 'rolled_back';
  }

  /**
   * Get Azure environment variables as array
   * @returns {Array} Array of environment variable objects
   */
  getAzureEnvironmentVariables() {
    if (!this.azure || !this.azure.environmentVariables) {
      return [];
    }

    return Object.entries(this.azure.environmentVariables).map(([name, value]) => ({
      name,
      value,
      slotSetting: false
    }));
  }

  /**
   * Generate Azure CLI script for environment setup
   * @returns {string} Azure CLI script
   */
  generateAzureCLIScript() {
    const { appServiceName, resourceGroup } = this.azure;
    const envVars = this.getAzureEnvironmentVariables();

    let script = `#!/bin/bash\n`;
    script += `# Azure App Service Environment Variables Configuration\n`;
    script += `# Generated on ${new Date().toISOString()}\n\n`;
    script += `APP_SERVICE_NAME="${appServiceName}"\n`;
    script += `RESOURCE_GROUP="${resourceGroup}"\n\n`;
    script += `echo "🔧 Configuring Azure App Service Environment Variables..."\n\n`;

    envVars.forEach(envVar => {
      script += `az webapp config appsettings set --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP --settings "${envVar.name}=${envVar.value}"\n`;
    });

    script += `\necho "✅ All environment variables configured!"\n`;
    script += `echo "🔍 Verifying configuration..."\n\n`;
    script += `az webapp config appsettings list --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP --query "[].{Name:name, Value:value}" --output table\n\n`;
    script += `echo "🚀 Backend configuration complete!"\n`;

    return script;
  }

  /**
   * Validate configuration completeness
   * @returns {Object} Validation result
   */
  validateCompleteness() {
    const errors = [];
    const warnings = [];

    // Check Azure configuration
    if (!this.azure.appServiceName) {
      errors.push('Azure app service name is required');
    }

    if (!this.azure.resourceGroup) {
      errors.push('Azure resource group is required');
    }

    if (!this.azure.environmentVariables || Object.keys(this.azure.environmentVariables).length === 0) {
      warnings.push('No Azure environment variables configured');
    }

    // Check frontend configuration
    if (!this.frontend.buildPath) {
      warnings.push('Frontend build path not specified');
    }

    // Check backend configuration
    if (!this.backend.packagePath) {
      warnings.push('Backend package path not specified');
    }

    if (!this.backend.startupCommand) {
      warnings.push('Backend startup command not specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: {
        azure: !!(this.azure.appServiceName && this.azure.resourceGroup),
        frontend: !!this.frontend.buildPath,
        backend: !!(this.backend.packagePath && this.backend.startupCommand)
      }
    };
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON object
   */
  toJSON() {
    return {
      id: this.id,
      environment: this.environment,
      timestamp: this.timestamp,
      version: this.version,
      azure: this.azure,
      frontend: this.frontend,
      backend: this.backend,
      status: this.status,
      validation: this.validateCompleteness(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = DeploymentConfig;