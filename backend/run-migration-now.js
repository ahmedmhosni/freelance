/**
 * Run Email Migration - Add Auth Columns
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
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

async function runMigration() {
  console.log('🔄 Starting email columns migration...\n');
  
  let pool;
  try {
    console.log('📡 Connecting to Azure SQL...');
    console.log(`   Server: ${config.server}`);
    console.log(`   Database: ${config.database}\n`);
    
    pool = await sql.connect(config);
    console.log('✅ Connected!\n');

    // Check existing columns
    console.log('🔍 Checking existing columns...');
    const checkResult = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('email_verified', 'email_verification_token', 'email_verification_expires', 'password_reset_token', 'password_reset_expires')
    `);

    if (checkResult.recordset.length > 0) {
      console.log('⚠️  Some columns already exist:');
      checkResult.recordset.forEach(row => console.log(`   - ${row.COLUMN_NAME}`));
      console.log('\n   Skipping existing columns...\n');
    }

    const columns = [
      { name: 'email_verified', sql: 'ALTER TABLE users ADD email_verified BIT DEFAULT 0' },
      { name: 'email_verification_token', sql: 'ALTER TABLE users ADD email_verification_token NVARCHAR(255)' },
      { name: 'email_verification_expires', sql: 'ALTER TABLE users ADD email_verification_expires DATETIME2' },
      { name: 'password_reset_token', sql: 'ALTER TABLE users ADD password_reset_token NVARCHAR(255)' },
      { name: 'password_reset_expires', sql: 'ALTER TABLE users ADD password_reset_expires DATETIME2' }
    ];

    for (const col of columns) {
      try {
        console.log(`📝 Adding ${col.name}...`);
        await pool.request().query(col.sql);
        console.log(`✅ ${col.name} added`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`⏭️  ${col.name} already exists, skipping`);
        } else {
          throw err;
        }
      }
    }

    // Create indexes
    console.log('\n📊 Creating indexes...');
    
    const indexes = [
      { name: 'idx_email_verification_token', sql: 'CREATE INDEX idx_email_verification_token ON users(email_verification_token)' },
      { name: 'idx_password_reset_token', sql: 'CREATE INDEX idx_password_reset_token ON users(password_reset_token)' }
    ];

    for (const idx of indexes) {
      try {
        await pool.request().query(idx.sql);
        console.log(`✅ ${idx.name} created`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`⏭️  ${idx.name} already exists, skipping`);
        } else {
          throw err;
        }
      }
    }

    // Verify
    console.log('\n🔍 Verifying migration...');
    const verifyResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('email_verified', 'email_verification_token', 'email_verification_expires', 'password_reset_token', 'password_reset_expires')
      ORDER BY COLUMN_NAME
    `);

    console.log('\n✅ Migration Results:');
    console.log('┌─────────────────────────────────┬──────────────┬─────────────┐');
    console.log('│ Column Name                     │ Data Type    │ Nullable    │');
    console.log('├─────────────────────────────────┼──────────────┼─────────────┤');
    verifyResult.recordset.forEach(row => {
      const col = row.COLUMN_NAME.padEnd(31);
      const type = row.DATA_TYPE.padEnd(12);
      const nullable = row.IS_NULLABLE.padEnd(11);
      console.log(`│ ${col} │ ${type} │ ${nullable} │`);
    });
    console.log('└─────────────────────────────────┴──────────────┴─────────────┘');

    console.log('\n🎉 Migration completed successfully!\n');
    console.log('✅ Email system is fully ready!');
    console.log('\n📧 You can now:');
    console.log('   - Register users with email verification');
    console.log('   - Reset passwords via email');
    console.log('   - Send all notifications\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.message.includes('Login failed')) {
      console.error('\n🔐 Authentication issue. Check:');
      console.error('   - AZURE_SQL_USER is correct');
      console.error('   - AZURE_SQL_PASSWORD is correct');
      console.error('   - Firewall allows your IP');
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('📡 Database connection closed');
    }
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
