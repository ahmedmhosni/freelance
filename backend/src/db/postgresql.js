const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Load environment variables - try .env.local first, then .env
const envLocalPath = path.join(__dirname, '../../.env.local');
const envPath = path.join(__dirname, '../../.env');

if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isAzure = process.env.WEBSITE_INSTANCE_ID !== undefined; // Azure App Service indicator

// PostgreSQL connection configuration
let config;

if (isProduction || isAzure) {
  // Production: Use Azure PostgreSQL
  console.log('🌐 Environment: PRODUCTION (Azure PostgreSQL)');
  // Debug: Log available DB environment variables
  console.log('🔍 Available DB Environment Variables:', {
    DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
    DB_DATABASE: process.env.DB_DATABASE || 'UNDEFINED',
    DB_NAME: process.env.DB_NAME || 'UNDEFINED',
    DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
    DB_PORT: process.env.DB_PORT || 'UNDEFINED'
  });

  config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'roastifydb',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false // Required for Azure PostgreSQL
    },
    // Production pool settings - more resilient timeouts
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // Increased from 10s to 15s
    acquireTimeoutMillis: 20000,    // Added: timeout for acquiring connection from pool
    maxUses: 7500,
    allowExitOnIdle: false,
  };
} else {
  // Development: Use local PostgreSQL
  console.log('💻 Environment: DEVELOPMENT (Local PostgreSQL)');
  config = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'roastify',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    ssl: false, // No SSL for local development
    // Development pool settings (smaller pool)
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,  // Increased from 5s to 8s
    acquireTimeoutMillis: 10000,    // Added: timeout for acquiring connection from pool
  };
}

console.log('🐘 Connecting to PostgreSQL:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  ssl: !!config.ssl,
  environment: isProduction || isAzure ? 'production' : 'development'
});

// Create connection pool
const pool = new Pool(config);

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
  // Don't exit the process, just log the error
  // The pool will attempt to reconnect automatically
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database pool...');
  await closePool();
  process.exit(0);
});

// Helper function to execute queries with retry logic
async function query(text, params = []) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(text, params);
      
      // If we succeeded after retries, log it
      if (attempt > 1) {
        console.log(`✅ Query succeeded on attempt ${attempt}/${maxRetries}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if this is a connection timeout or connection error
      const isConnectionError = 
        error.message.includes('Connection terminated') ||
        error.message.includes('connection timeout') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ENOTFOUND') ||
        error.code === 'ECONNABORTED';

      if (isConnectionError && attempt < maxRetries) {
        console.warn(`⚠️ Database connection error on attempt ${attempt}/${maxRetries}, retrying...`);
        console.warn(`Error: ${error.message}`);
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If it's not a connection error or we've exhausted retries, log and throw
      console.error('PostgreSQL query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      
      if (attempt === maxRetries) {
        console.error(`❌ Query failed after ${maxRetries} attempts`);
      }
      
      throw error;
    }
  }
}

// Helper to get single row
async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

// Helper to get all rows
async function getAll(text, params = []) {
  const result = await query(text, params);
  return result.rows || [];
}

// Close pool
async function closePool() {
  await pool.end();
  console.log('PostgreSQL connection pool closed');
}

module.exports = {
  pool,
  query,
  getOne,
  getAll,
  closePool
};
