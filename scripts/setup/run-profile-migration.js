require('dotenv').config({ path: '../../backend/.env' });
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'FreelancerDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

// Use Windows Authentication if no user/password
if (!config.user || !config.password) {
  config.authentication = {
    type: 'default'
  };
  delete config.user;
  delete config.password;
}

async function runMigration() {
  console.log('🚀 Running Profile Fields Migration...\n');
  console.log('='.repeat(60));
  console.log(`Server: ${config.server}:${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, '../../database/migrations/ADD_USER_PROFILE_FIELDS.sql');
    const sqlScript = fs.readFileSync(sqlFile, 'utf8');

    // Connect to database
    console.log('📡 Connecting to database...');
    const pool = await sql.connect(config);
    console.log('✅ Connected!\n');

    // Split script by GO statements
    const batches = sqlScript
      .split(/^\s*GO\s*$/gim)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0 && !batch.startsWith('--'));

    console.log(`📝 Found ${batches.length} SQL batches to execute\n`);

    // Execute each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      // Skip USE statements
      if (batch.startsWith('USE ')) {
        continue;
      }

      try {
        const result = await pool.request().query(batch);
        
        // Print any messages
        if (result.recordset && result.recordset.length > 0) {
          result.recordset.forEach(row => {
            if (row.message) console.log(row.message);
          });
        }
      } catch (err) {
        // Some errors are expected (like PRINT statements)
        if (!err.message.includes('PRINT')) {
          console.log(`⚠️  Batch ${i + 1}: ${err.message}`);
        }
      }
    }

    // Verify columns were added
    console.log('\n📊 Verifying profile fields...\n');
    const verifyQuery = `
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN (
        'username', 'job_title', 'bio', 'profile_picture', 'location', 'website',
        'linkedin', 'behance', 'instagram', 'facebook', 'twitter', 'github', 'dribbble', 'portfolio',
        'profile_visibility'
      )
      ORDER BY COLUMN_NAME
    `;
    
    const verify = await pool.request().query(verifyQuery);
    
    console.log(`✅ Found ${verify.recordset.length} profile fields:\n`);
    verify.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  ✓ ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length}`);
    });

    await pool.close();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Profile Fields Migration Complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('  1. Restart your backend server');
    console.log('  2. Visit http://localhost:3000/profile');
    console.log('  3. Fill in your profile information');
    console.log('  4. Test public profile at /profile/your-username');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Check database connection settings in backend/.env');
    console.log('  2. Verify SQL Server is running');
    console.log('  3. Check if you have permissions to alter tables');
    console.log('  4. Try running the SQL script manually in SSMS');
    process.exit(1);
  }
}

runMigration();
