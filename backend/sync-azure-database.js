const { Pool } = require('pg');

// Azure PostgreSQL database configuration
const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

async function syncAzureDatabase() {
  try {
    console.log('🔍 Connecting to Azure production database...');
    console.log(`📍 Host: roastifydbpost.postgres.database.azure.com`);
    console.log(`📍 Database: roastifydb\n`);

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!\n');

    // Check current users table structure
    console.log('📋 Checking users table structure...\n');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('Current columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Required columns for the new architecture
    const requiredColumns = [
      { name: 'email_verified', type: 'BOOLEAN', default: 'false' },
      { name: 'login_count', type: 'INTEGER', default: '0' },
      { name: 'last_login_at', type: 'TIMESTAMP', default: null },
      { name: 'last_activity_at', type: 'TIMESTAMP', default: null }
    ];

    console.log('\n🔧 Checking for missing columns...\n');

    let addedColumns = 0;
    for (const column of requiredColumns) {
      const exists = columns.rows.find(col => col.column_name === column.name);
      
      if (!exists) {
        console.log(`➕ Adding column: ${column.name}...`);
        const defaultClause = column.default ? `DEFAULT ${column.default}` : '';
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN ${column.name} ${column.type} ${defaultClause}
        `);
        console.log(`✅ Added column: ${column.name}`);
        addedColumns++;
      } else {
        console.log(`✓ Column exists: ${column.name}`);
      }
    }

    if (addedColumns === 0) {
      console.log('\n✅ All required columns already exist!');
    } else {
      console.log(`\n✅ Added ${addedColumns} missing column(s)!`);
    }

    // Check if admin user exists
    console.log('\n👤 Checking for admin user...\n');
    const adminCheck = await pool.query(
      'SELECT id, email, role, email_verified FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );

    if (adminCheck.rows.length > 0) {
      const admin = adminCheck.rows[0];
      console.log(`✓ Admin user exists:`);
      console.log(`  - ID: ${admin.id}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Role: ${admin.role}`);
      console.log(`  - Email Verified: ${admin.email_verified}`);

      if (!admin.email_verified) {
        console.log('\n🔧 Verifying admin email...');
        await pool.query(
          'UPDATE users SET email_verified = true WHERE email = $1',
          ['ahmedmhosni90@gmail.com']
        );
        console.log('✅ Admin email verified!');
      }
    } else {
      console.log('⚠️  Admin user does not exist in production database.');
      console.log('   Run create-admin-user.js with production credentials to create it.');
    }

    await pool.end();
    console.log('\n🎉 Azure database sync complete!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    process.exit(1);
  }
}

syncAzureDatabase();
