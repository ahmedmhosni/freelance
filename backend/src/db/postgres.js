const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const config = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

console.log('🐘 Connecting to PostgreSQL:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  ssl: !!config.ssl
});

// Create connection pool
const pool = new Pool(config);

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Helper function to execute queries
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
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

// Create a request-like interface to match SQL Server adapter
function createRequest() {
  const inputs = {};
  let paramIndex = 1;
  const paramMap = {};

  const requestObj = {
    input: (name, type, value) => {
      // Store the value with parameter index
      paramMap[name] = paramIndex;
      inputs[paramIndex] = value;
      paramIndex++;
      return requestObj; // Return same object to maintain state
    },
    query: async (queryText) => {
      try {
        // Convert SQL Server syntax to PostgreSQL
        let pgQuery = queryText;
        
        // Replace @paramName with $1, $2, etc.
        Object.keys(paramMap).forEach(paramName => {
          const regex = new RegExp(`@${paramName}\\b`, 'g');
          pgQuery = pgQuery.replace(regex, `$${paramMap[paramName]}`);
        });
        
        // Convert SQL Server specific syntax to PostgreSQL
        pgQuery = pgQuery
          // GETDATE() -> NOW()
          .replace(/GETDATE\(\)/gi, 'NOW()')
          // TOP n -> LIMIT n
          .replace(/SELECT\s+TOP\s+(\d+)/gi, 'SELECT')
          .replace(/TOP\s+(\d+)/gi, '')
          // OUTPUT INSERTED.* -> RETURNING *
          .replace(/OUTPUT\s+INSERTED\.\*/gi, 'RETURNING *')
          .replace(/OUTPUT\s+INSERTED\.(\w+)/gi, 'RETURNING $1')
          // IDENTITY columns are handled by SERIAL
          .replace(/INT\s+IDENTITY\(1,1\)/gi, 'SERIAL')
          // BIT -> BOOLEAN
          .replace(/\bBIT\b/gi, 'BOOLEAN')
          // NVARCHAR -> VARCHAR
          .replace(/NVARCHAR/gi, 'VARCHAR')
          // DATETIME2 -> TIMESTAMP
          .replace(/DATETIME2/gi, 'TIMESTAMP');
        
        // Handle LIMIT for TOP queries
        const topMatch = queryText.match(/TOP\s+(\d+)/i);
        if (topMatch) {
          pgQuery += ` LIMIT ${topMatch[1]}`;
        }
        
        // Get parameter values in order
        const paramValues = Object.keys(inputs)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(key => inputs[key]);
        
        // Execute query
        const result = await pool.query(pgQuery, paramValues);
        
        // Return in SQL Server format
        return {
          recordset: result.rows,
          rowsAffected: [result.rowCount]
        };
      } catch (error) {
        console.error('PostgreSQL query error:', error);
        console.error('Original query:', queryText);
        throw error;
      }
    }
  };
  
  return requestObj;
}

// Export pool as a promise (to match Azure SQL interface)
async function getPool() {
  return {
    request: createRequest
  };
}

module.exports = getPool();
module.exports.pool = pool;
module.exports.query = query;
module.exports.getOne = getOne;
module.exports.getAll = getAll;
module.exports.closePool = async () => {
  await pool.end();
  console.log('PostgreSQL connection pool closed');
};
