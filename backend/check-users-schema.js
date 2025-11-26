const sql = require('mssql');
require('dotenv').config({ path: '.env.azure' });

const config = {
  server: process.env.AZURE_SQL_SERVER || process.env.DB_SERVER,
  database: process.env.AZURE_SQL_DATABASE || process.env.DB_NAME,
  user: process.env.AZURE_SQL_USER || process.env.DB_USER,
  password: process.env.AZURE_SQL_PASSWORD || process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function checkUsersSchema() {
  try {
    console.log('Connecting to Azure SQL Database...');
    console.log('Server:', config.server);
    console.log('Database:', config.database);
    console.log('');

    const pool = await sql.connect(config);
    
    console.log('✓ Connected successfully!\n');
    console.log('========================================');
    console.log('USERS TABLE SCHEMA');
    console.log('========================================\n');

    // Get all columns from users table
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);

    if (result.recordset.length === 0) {
      console.log('❌ Users table not found!');
    } else {
      console.log('Columns in users table:\n');
      result.recordset.forEach(col => {
        const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
        console.log(`  ${col.COLUMN_NAME.padEnd(35)} ${col.DATA_TYPE}${length.padEnd(10)} ${nullable}${defaultVal}`);
      });

      console.log('\n========================================');
      console.log('EMAIL VERIFICATION COLUMNS CHECK');
      console.log('========================================\n');

      const verificationColumns = [
        'email_verified',
        'email_verification_token',
        'email_verification_code',
        'email_verification_expires',
        'password_reset_token',
        'password_reset_expires'
      ];

      verificationColumns.forEach(colName => {
        const exists = result.recordset.find(col => col.COLUMN_NAME === colName);
        if (exists) {
          console.log(`  ✓ ${colName.padEnd(30)} EXISTS (${exists.DATA_TYPE})`);
        } else {
          console.log(`  ✗ ${colName.padEnd(30)} MISSING`);
        }
      });
    }

    console.log('\n========================================');
    console.log('SAMPLE USER DATA');
    console.log('========================================\n');

    // Get sample user data (first user)
    const userData = await pool.request().query(`
      SELECT TOP 1 
        id, 
        name, 
        email, 
        role,
        email_verified,
        created_at
      FROM users
      ORDER BY id
    `);

    if (userData.recordset.length > 0) {
      const user = userData.recordset[0];
      console.log('Sample user:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Email Verified: ${user.email_verified !== undefined ? user.email_verified : 'N/A'}`);
      console.log(`  Created: ${user.created_at}`);
    } else {
      console.log('No users found in database');
    }

    console.log('\n========================================\n');

    await pool.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsersSchema();
