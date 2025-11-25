const sql = require('mssql');
require('dotenv').config({ path: '.env.azure' });

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function checkAndApplyMigration() {
  let pool;
  
  try {
    console.log('🔌 Connecting to Azure SQL Database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!\n');

    // Check if profile fields exist
    console.log('🔍 Checking if profile fields exist...');
    const checkQuery = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users'
      AND COLUMN_NAME IN (
        'username', 'job_title', 'bio', 'profile_picture', 'location', 
        'website', 'linkedin', 'behance', 'instagram', 'facebook', 
        'twitter', 'github', 'dribbble', 'portfolio', 'profile_visibility'
      )
      ORDER BY COLUMN_NAME;
    `;
    
    const result = await pool.request().query(checkQuery);
    
    if (result.recordset.length === 0) {
      console.log('❌ Profile fields NOT found. Applying migration...\n');
      
      // Apply migration
      const migrationSQL = `
        -- Add profile fields to users table
        ALTER TABLE users ADD username NVARCHAR(100) NULL;
        ALTER TABLE users ADD job_title NVARCHAR(255) NULL;
        ALTER TABLE users ADD bio NVARCHAR(MAX) NULL;
        ALTER TABLE users ADD profile_picture NVARCHAR(500) NULL;
        ALTER TABLE users ADD location NVARCHAR(255) NULL;
        ALTER TABLE users ADD website NVARCHAR(500) NULL;
        ALTER TABLE users ADD linkedin NVARCHAR(500) NULL;
        ALTER TABLE users ADD behance NVARCHAR(500) NULL;
        ALTER TABLE users ADD instagram NVARCHAR(500) NULL;
        ALTER TABLE users ADD facebook NVARCHAR(500) NULL;
        ALTER TABLE users ADD twitter NVARCHAR(500) NULL;
        ALTER TABLE users ADD github NVARCHAR(500) NULL;
        ALTER TABLE users ADD dribbble NVARCHAR(500) NULL;
        ALTER TABLE users ADD portfolio NVARCHAR(500) NULL;
        ALTER TABLE users ADD profile_visibility NVARCHAR(50) DEFAULT 'public';
      `;
      
      await pool.request().query(migrationSQL);
      console.log('✅ Profile fields added successfully!\n');
      
      // Create unique index for username
      console.log('🔧 Creating unique index for username...');
      const indexSQL = `
        CREATE UNIQUE NONCLUSTERED INDEX idx_users_username_unique 
        ON users(username) 
        WHERE username IS NOT NULL;
      `;
      
      await pool.request().query(indexSQL);
      console.log('✅ Unique index created successfully!\n');
      
    } else {
      console.log(`✅ Profile fields already exist (${result.recordset.length} fields found):\n`);
      result.recordset.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
      });
      console.log('');
    }

    // Verify final schema
    console.log('📊 Final schema verification:');
    const verifyQuery = `
      SELECT COUNT(*) as total_columns
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users';
    `;
    
    const verifyResult = await pool.request().query(verifyQuery);
    console.log(`   Total columns in users table: ${verifyResult.recordset[0].total_columns}\n`);
    
    console.log('🎉 Migration check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.originalError) {
      console.error('   Original error:', error.originalError.message);
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

checkAndApplyMigration();
