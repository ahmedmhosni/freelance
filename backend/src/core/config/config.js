require('dotenv').config();

/**
 * Application Configuration
 * Loads and validates configuration from environment variables
 */
class Config {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.port = parseInt(process.env.PORT || '5000', 10);
    
    // Application
    this.app = {
      name: process.env.APP_NAME || 'Freelancer Management',
      url: process.env.APP_URL || 'http://localhost:5173',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
    };

    // Database Configuration - Support both Azure (DB_*) and local (PG_*) variables
    const isAzure = process.env.WEBSITE_INSTANCE_ID !== undefined;
    this.database = {
      host: process.env.DB_HOST || process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || process.env.PG_PORT || '5432', 10),
      database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.PG_DATABASE || 'freelancer_db',
      user: process.env.DB_USER || process.env.PG_USER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.PG_PASSWORD || 'postgres',
      ssl: isAzure || process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PG_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };

    // JWT Configuration
    this.jwt = {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    // Email Configuration
    this.email = {
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      azureConnectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING
    };

    // Logging
    this.logging = {
      level: process.env.LOG_LEVEL || 'info',
      logQueries: this.env === 'development'
    };

    // Token Expiration
    this.tokens = {
      emailVerificationExpiry: process.env.EMAIL_VERIFICATION_EXPIRY || '24h',
      passwordResetExpiry: process.env.PASSWORD_RESET_EXPIRY || '1h'
    };
  }

  /**
   * Validate required configuration
   * @throws {Error} If required configuration is missing
   */
  validate() {
    const required = [
      { key: 'JWT_SECRET', value: this.jwt.secret, message: 'JWT_SECRET is required' }
    ];

    const missing = required.filter(item => !item.value);

    if (missing.length > 0) {
      const messages = missing.map(item => item.message).join(', ');
      throw new Error(`Configuration validation failed: ${messages}`);
    }

    // Validate JWT secret length in production
    if (this.env === 'production' && this.jwt.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
  }

  /**
   * Check if running in production
   * @returns {boolean}
   */
  isProduction() {
    return this.env === 'production';
  }

  /**
   * Check if running in development
   * @returns {boolean}
   */
  isDevelopment() {
    return this.env === 'development';
  }

  /**
   * Check if running in test
   * @returns {boolean}
   */
  isTest() {
    return this.env === 'test';
  }

  /**
   * Get database configuration
   * @returns {Object} Database config
   */
  getDatabaseConfig() {
    return { ...this.database };
  }

  /**
   * Get safe configuration (without sensitive data)
   * @returns {Object} Safe config
   */
  getSafeConfig() {
    return {
      env: this.env,
      port: this.port,
      app: this.app,
      database: {
        host: this.database.host,
        port: this.database.port,
        database: this.database.database,
        user: this.database.user,
        ssl: this.database.ssl
      },
      logging: this.logging
    };
  }
}

// Create singleton instance
const config = new Config();

// Validate on load (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  try {
    config.validate();
  } catch (error) {
    console.error('Configuration Error:', error.message);
    process.exit(1);
  }
}

module.exports = config;
