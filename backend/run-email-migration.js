/**
 * Run Email Migration
 * Adds email verification and password reset columns to users table
 */

require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.AZURE_SQL_SERVER || process.env.DB_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT || process.env.DB_PORT || '1433'),
  database: process.env.AZURE_SQL_DATABASE || process.env.DB_DATABASE,
  user: process.env.AZURE_SQL_USER || process.env.DB_USER,
  password: process.env.AZURE_SQL_PASSWORD || process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.AZURE_SQL_ENCRYPT === 'true' || process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  }
};

async function runMigration() {
  console.log('🔄 Starting email migration...\n');
  
  let pool;
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected!\n');

    // Check if columns already exist
    console.log('🔍 Checking existing columns...');
    const checkResult = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('email_verified', 'email_verification_token', 'email_verification_expires', 'password_reset_token', 'password_reset_expires')
    `);

    if (checkResult.recordset.length > 0) {
      console.log('⚠️  Some columns already exist:');
      checkResult.recordset.forEach(row => {
        console.log(`   - ${row.COLUMN_NAME}`);
      });
      console.log('\n❓ Do you want to continue? This will skip existing columns.');
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Add email_verified column
    console.log('📝 Adding email_verified column...');
    try {
      await pool.request().query(`
        ALTER TABLE users ADD email_verified BIT DEFAULT 0
      `);
      console.log('✅ email_verified added');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  email_verified already exists, skipping');
      } else {
        throw err;
      }
    }

    // Add email_verification_token column
    console.log('📝 Adding email_verification_token column...');
    try {
      await pool.request().query(`
        ALTER TABLE users ADD email_verification_token NVARCHAR(255)
      `);
      console.log('✅ email_verification_token added');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  email_verification_token already exists, skipping');
      } else {
        throw err;
      }
    }

    // Add email_verification_expires column
    console.log('📝 Adding email_verification_expires column...');
    try {
      await pool.request().query(`
        ALTER TABLE users ADD email_verification_expires DATETIME2
      `);
      console.log('✅ email_verification_expires added');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  email_verification_expires already exists, skipping');
      } else {
        throw err;
      }
    }

    // Add password_reset_token column
    console.log('📝 Adding password_reset_token column...');
    try {
      await pool.request().query(`
        ALTER TABLE users ADD password_reset_token NVARCHAR(255)
      `);
      console.log('✅ password_reset_token added');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  password_reset_token already exists, skipping');
      } else {
        throw err;
      }
    }

    // Add password_reset_expires column
    console.log('📝 Adding password_reset_expires column...');
    try {
      await pool.request().query(`
        ALTER TABLE users ADD password_reset_expires DATETIME2
      `);
      console.log('✅ password_reset_expires added');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  password_reset_expires already exists, skipping');
      } else {
        throw err;
      }
    }

    // Create indexes
    console.log('\n📊 Creating indexes...');
    
    try {
      await pool.request().query(`
        CREATE INDEX idx_email_verification_token ON users(email_verification_token)
      `);
      console.log('✅ Index on email_verification_token created');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Index on email_verification_token already exists, skipping');
      } else {
        throw err;
      }
    }

    try {
      await pool.request().query(`
        CREATE INDEX idx_password_reset_token ON users(password_reset_token)
      `);
      console.log('✅ Index on password_reset_token created');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Index on password_reset_token already exists, skipping');
      } else {
        throw err;
      }
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const verifyResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('email_verified', 'email_verification_token', 'email_verification_expires', 'password_reset_token', 'password_reset_expires')
      ORDER BY COLUMN_NAME
    `);

    console.log('\n📋 Migration Results:');
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

    console.log('\n✅ Migration completed successfully!\n');
    console.log('🎉 Email system is ready to use!');
    console.log('\n📧 Next steps:');
    console.log('   1. Make sure AZURE_COMMUNICATION_CONNECTION_STRING is set in .env');
    console.log('   2. Restart your backend server');
    console.log('   3. Test registration - you should receive verification email!');
    console.log('   4. Test password reset functionality\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔍 Error details:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('📡 Database connection closed');
    }
  }
}

// Run migration
runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
