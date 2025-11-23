const sql = require('mssql');

// Azure SQL configuration
const config = {
  server: process.env.AZURE_SQL_SERVER || 'roastify-db-server.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'roastifydbazure',
  user: process.env.AZURE_SQL_USER || 'adminuser',
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create connection pool
let pool = null;

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('✓ Connected to Azure SQL Database');
    } catch (err) {
      console.error('Azure SQL connection error:', err);
      throw err;
    }
  }
  return pool;
}

// Helper function to execute queries
async function query(queryText, params = []) {
  try {
    const pool = await getPool();
    const request = pool.request();
    
    // Add parameters
    params.forEach((param, index) => {
      request.input(`param${index + 1}`, param);
    });
    
    const result = await request.query(queryText);
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

// Helper to get single row
async function getOne(queryText, params = []) {
  const result = await query(queryText, params);
  return result.recordset[0] || null;
}

// Helper to get all rows
async function getAll(queryText, params = []) {
  const result = await query(queryText, params);
  return result.recordset || [];
}

// Close connection
async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Azure SQL connection closed');
  }
}

module.exports = {
  sql,
  getPool,
  query,
  getOne,
  getAll,
  closePool
};
