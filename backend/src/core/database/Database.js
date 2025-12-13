const { Pool } = require('pg');
const logger = require('../logger');

/**
 * PostgreSQL Database Layer
 * Provides connection pooling, query execution, and transaction management
 */
class Database {
  constructor(config = {}) {
    // Determine environment
    const isProduction = process.env.NODE_ENV === 'production';
    const isAzure = process.env.WEBSITE_INSTANCE_ID !== undefined;
    
    // Use production (DB_*) or development (PG_*) variables
    if (isProduction || isAzure) {
      // Production: Use Azure PostgreSQL (DB_* variables)
      this.config = {
        host: config.host || process.env.DB_HOST,
        port: parseInt(config.port || process.env.DB_PORT || '5432'),
        database: config.database || process.env.DB_DATABASE || process.env.DB_NAME,
        user: config.user || process.env.DB_USER,
        password: config.password || process.env.DB_PASSWORD,
        ssl: config.ssl || { rejectUnauthorized: false },
        max: config.max || parseInt(process.env.PG_POOL_MAX || '20'),
        idleTimeoutMillis: config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
      };
    } else {
      // Development: Use local PostgreSQL (PG_* variables)
      this.config = {
        host: config.host || process.env.PG_HOST || 'localhost',
        port: parseInt(config.port || process.env.PG_PORT || '5432'),
        database: config.database || process.env.PG_DATABASE || 'roastify',
        user: config.user || process.env.PG_USER || 'postgres',
        password: config.password || process.env.PG_PASSWORD || 'postgres',
        ssl: config.ssl || (process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false),
        max: config.max || parseInt(process.env.PG_POOL_MAX || '10'),
        idleTimeoutMillis: config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
      };
    }

    this.pool = null;
    this.isConnected = false;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.logQueries = config.logQueries !== undefined ? config.logQueries : (process.env.NODE_ENV === 'development');
    this.environment = isProduction || isAzure ? 'production' : 'development';
  }

  /**
   * Initialize the database connection pool
   */
  async connect() {
    if (this.isConnected) {
      return;
    }

    let lastError;
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.pool = new Pool(this.config);

        // Test connection
        await this.pool.query('SELECT NOW()');
        
        this.isConnected = true;

        // Setup event handlers
        this.pool.on('error', (err) => {
          logger.error('Unexpected database pool error', err);
        });

        logger.info('Connected to PostgreSQL database', {
          environment: this.environment,
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          ssl: !!this.config.ssl
        });

        return;
      } catch (error) {
        lastError = error;
        logger.error(`Database connection attempt ${attempt}/${this.retryAttempts} failed`, {
          error: error.message,
          attempt,
          maxAttempts: this.retryAttempts
        });
        
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          logger.info(`Retrying database connection in ${delay}ms`);
          await this._sleep(delay);
        }
      }
    }

    throw new Error(`Failed to connect to database after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Execute a query and return the full result object
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result object
   */
  async query(sql, params = []) {
    await this._ensureConnected();

    const startTime = Date.now();

    try {
      const result = await this.pool.query(sql, params);
      const duration = Date.now() - startTime;
      
      logger.logQuery(sql, params, duration);
      
      return result;
    } catch (error) {
      const enhancedError = this._enhanceError(error, sql, params);
      logger.logDatabaseError(sql, enhancedError);
      throw enhancedError;
    }
  }

  /**
   * Execute a query and return a single row
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>} Single row or null
   */
  async queryOne(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Execute a query and return all rows
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Array of rows
   */
  async queryMany(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows || [];
  }

  /**
   * Execute a query without returning results (INSERT, UPDATE, DELETE)
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise<number>} Number of affected rows
   */
  async execute(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rowCount;
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Async function that receives a client
   * @returns {Promise<*>} Result from callback
   */
  async transaction(callback) {
    await this._ensureConnected();

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create a transaction-scoped query interface
      const txClient = {
        query: async (sql, params = []) => {
          const startTime = Date.now();
          try {
            const result = await client.query(sql, params);
            const duration = Date.now() - startTime;
            logger.logQuery(`[Transaction] ${sql}`, params, duration);
            return result;
          } catch (error) {
            const enhancedError = this._enhanceError(error, sql, params);
            logger.logDatabaseError(`[Transaction] ${sql}`, enhancedError);
            throw enhancedError;
          }
        },
        queryOne: async (sql, params = []) => {
          const result = await txClient.query(sql, params);
          return result.rows[0] || null;
        },
        queryMany: async (sql, params = []) => {
          const result = await txClient.query(sql, params);
          return result.rows || [];
        },
        execute: async (sql, params = []) => {
          const result = await txClient.query(sql, params);
          return result.rowCount;
        }
      };

      const result = await callback(txClient);
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client from the pool for manual transaction management
   * @returns {Promise<Object>} Database client
   */
  async getClient() {
    await this._ensureConnected();
    return await this.pool.connect();
  }

  /**
   * Release a client back to the pool
   * @param {Object} client - Database client
   */
  releaseClient(client) {
    if (client && typeof client.release === 'function') {
      client.release();
    }
  }

  /**
   * Check if database is connected and healthy
   * @returns {Promise<boolean>} True if healthy
   */
  async healthCheck() {
    try {
      await this._ensureConnected();
      const result = await this.pool.query('SELECT 1 as health');
      return result.rows[0].health === 1;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }

  /**
   * Close the database connection pool
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      this.pool = null;
      
      logger.info('Database connection pool closed');
    }
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount
    };
  }

  /**
   * Ensure database is connected
   * @private
   */
  async _ensureConnected() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Enhance error with query context
   * @private
   */
  _enhanceError(error, sql, params) {
    const enhancedError = new Error(error.message);
    enhancedError.name = 'DatabaseError';
    enhancedError.originalError = error;
    enhancedError.query = sql;
    enhancedError.params = params;
    enhancedError.code = error.code;
    enhancedError.detail = error.detail;
    enhancedError.constraint = error.constraint;
    enhancedError.table = error.table;
    enhancedError.column = error.column;
    enhancedError.stack = error.stack;
    
    return enhancedError;
  }

  /**
   * Sleep utility for retry logic
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Database;
