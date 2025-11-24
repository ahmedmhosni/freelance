const sql = require('mssql');
const logger = require('../utils/logger');

// Azure SQL connection pool configuration
const poolConfig = {
  server: process.env.AZURE_SQL_SERVER || process.env.DB_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT || process.env.DB_PORT || '1433'),
  database: process.env.AZURE_SQL_DATABASE || process.env.DB_DATABASE,
  user: process.env.AZURE_SQL_USER || process.env.DB_USER,
  password: process.env.AZURE_SQL_PASSWORD || process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.AZURE_SQL_ENCRYPT === 'true' || process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000
  }
};

let pool = null;

// Create and manage connection pool
const getPool = async () => {
  if (!pool) {
    try {
      pool = await new sql.ConnectionPool(poolConfig).connect();
      
      logger.info('Database connection pool created successfully');

      // Handle pool errors
      pool.on('error', err => {
        logger.error('Database pool error:', err);
        pool = null; // Reset pool on error
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        if (pool) {
          await pool.close();
          logger.info('Database pool closed');
        }
        process.exit(0);
      });

    } catch (err) {
      logger.error('Failed to create database pool:', err);
      throw err;
    }
  }
  return pool;
};

// Execute query with transaction support
const executeTransaction = async (callback) => {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    logger.error('Transaction rolled back:', err);
    throw err;
  }
};

module.exports = {
  getPool,
  executeTransaction,
  sql
};
