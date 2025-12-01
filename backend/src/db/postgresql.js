const { Pool } = require('pg');
const path = require('path');

// Load environment variables from .env.local if it exists
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

// PostgreSQL connection configuration
const config = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  ssl:
    process.env.PG_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

console.log('🐘 Connecting to PostgreSQL:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  ssl: !!config.ssl,
});

// Create connection pool
const pool = new Pool(config);

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Helper function to execute queries
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('PostgreSQL query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
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
  closePool,
};
