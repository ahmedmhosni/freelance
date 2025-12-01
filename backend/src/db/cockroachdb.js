const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: true,
          ca: process.env.DATABASE_CA_CERT
            ? require('fs').readFileSync(process.env.DATABASE_CA_CERT, 'utf8')
            : undefined,
        }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to CockroachDB');
});

pool.on('error', (err) => {
  console.error('CockroachDB connection error:', err);
});

// Helper function to execute queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Helper to get single row
async function getOne(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

// Helper to get all rows
async function getAll(text, params) {
  const result = await query(text, params);
  return result.rows;
}

module.exports = {
  pool,
  query,
  getOne,
  getAll,
};
