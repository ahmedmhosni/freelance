const sql = require('mssql');

// Load environment variables
require('dotenv').config();

// SQL Server configuration - supports both local and Azure
const isAzureSQL = (process.env.DB_SERVER || process.env.AZURE_SQL_SERVER || '').includes('database.windows.net');

const config = {
  server: process.env.DB_SERVER || process.env.AZURE_SQL_SERVER || 'roastify-db-server.database.windows.net',
  database: process.env.DB_DATABASE || process.env.AZURE_SQL_DATABASE || 'roastifydbazure',
  user: process.env.DB_USER !== undefined ? process.env.DB_USER : process.env.AZURE_SQL_USER,
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : process.env.AZURE_SQL_PASSWORD,
  port: parseInt(process.env.DB_PORT || process.env.AZURE_SQL_PORT || '1433'),
  options: {
    encrypt: isAzureSQL ? true : (process.env.DB_ENCRYPT === 'true'),
    trustServerCertificate: isAzureSQL ? false : (process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'),
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
    useUTC: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Use Windows Authentication only for local SQL Server Express
if ((!config.user || config.user === '') && (!config.password || config.password === '')) {
  // Local SQL Server with Windows Authentication
  config.authentication = {
    type: 'default'
  };
  delete config.user;
  delete config.password;
  
  // Don't use instance name if port is specified
  if (config.port && config.port !== 1433) {
    delete config.options.instanceName;
    console.log(`Using Windows Authentication for SQL Server: ${config.server}:${config.port}`);
  } else if (config.server.includes('\\')) {
    // Handle named instances like AHMED\SQLEXPRESS01
    const parts = config.server.split('\\');
    config.server = parts[0];
    config.options.instanceName = parts[1];
    console.log(`Using Windows Authentication for SQL Server: ${config.server}\\${config.options.instanceName}`);
  } else {
    config.options.instanceName = 'SQLEXPRESS';
    console.log(`Using Windows Authentication for SQL Server: ${config.server}\\${config.options.instanceName}`);
  }
} else if (config.server.includes('azure') || config.server.includes('database.windows.net')) {
  // Azure SQL - use SQL Authentication
  console.log(`Connecting to Azure SQL: ${config.server}`);
  console.log(`Encryption enabled: ${config.options.encrypt}`);
  delete config.options.instanceName;
}

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

// Export pool as default for easier usage
module.exports = getPool();

// Also export named exports
module.exports.sql = sql;
module.exports.getPool = getPool;
module.exports.query = query;
module.exports.getOne = getOne;
module.exports.getAll = getAll;
module.exports.closePool = closePool;
