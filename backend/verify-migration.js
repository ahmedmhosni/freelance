/**
 * Verify Email Migration
 */

require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.AZURE_SQL_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

async function verify() {
  console.log('🔍 Verifying Email System Setup...\n');
  
  let pool;
  try {
    pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('email_verified', 'email_verification_token', 'email_verification_expires', 'password_reset_token', 'password_reset_expires')
      ORDER BY COLUMN_NAME
    `);

    console.log('✅ Database Columns:');
    console.log('┌─────────────────────────────────┬──────────────┬─────────────┐');
    console.log('│ Column Name                     │ Data Type    │ Nullable    │');
    console.log('├─────────────────────────────────┼──────────────┼─────────────┤');
    result.recordset.forEach(row => {
      const col = row.COLUMN_NAME.padEnd(31);
      const type = row.DATA_TYPE.padEnd(12);
      const nullable = row.IS_NULLABLE.padEnd(11);
      console.log(`│ ${col} │ ${type} │ ${nullable} │`);
    });
    console.log('└─────────────────────────────────┴──────────────┴─────────────┘');

    if (result.recordset.length === 5) {
      console.log('\n🎉 All columns present! Email system is ready!\n');
      console.log('✅ You can now:');
      console.log('   1. Register users with email verification');
      console.log('   2. Reset passwords via email');
      console.log('   3. Send welcome emails');
      console.log('   4. Send invoice notifications');
      console.log('   5. Send task reminders\n');
    } else {
      console.log(`\n⚠️  Only ${result.recordset.length}/5 columns found!`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) await pool.close();
  }
}

verify();
