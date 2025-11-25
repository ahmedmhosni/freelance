require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'FreelancerDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  }
};

if (!config.user || !config.password) {
  config.authentication = { type: 'default' };
  delete config.user;
  delete config.password;
}

async function verifyFields() {
  try {
    const pool = await sql.connect(config);
    
    const query = `
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `;
    
    const result = await pool.request().query(query);
    
    console.log('\n📋 All fields in users table:\n');
    result.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE}${length.padEnd(10)} ${nullable}`);
    });
    
    console.log(`\n✅ Total: ${result.recordset.length} columns\n`);
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyFields();
