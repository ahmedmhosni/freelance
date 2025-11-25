require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.AZURE_SQL_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
  database: process.env.AZURE_SQL_DATABASE,
  user: 'adminuser',
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

console.log('Testing connection with:');
console.log('Server:', config.server);
console.log('Database:', config.database);
console.log('User:', config.user);
console.log('Password:', config.password ? '***' + config.password.slice(-4) : 'NOT SET');
console.log('');

async function testConnection() {
  try {
    console.log('Connecting...');
    const pool = await sql.connect(config);
    console.log('✅ Connected successfully!');
    
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('Database version:', result.recordset[0].version);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();
