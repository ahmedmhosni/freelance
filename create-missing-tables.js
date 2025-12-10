const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function createMissingTables() {
  console.log('\n🔧 Creating missing tables in Azure database...\n');

  try {
    // 1. deleted_accounts table
    console.log('Creating deleted_accounts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deleted_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        email VARCHAR(255),
        name VARCHAR(255),
        deletion_reason TEXT,
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_export_url TEXT,
        permanent_deletion_date TIMESTAMP
      )
    `);
    console.log('✅ deleted_accounts table created\n');

    // 2. email_preferences table
    console.log('Creating email_preferences table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_preferences (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        marketing_emails BOOLEAN DEFAULT true,
        notification_emails BOOLEAN DEFAULT true,
        update_emails BOOLEAN DEFAULT true,
        newsletter BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ email_preferences table created\n');

    // 3. password_resets table
    console.log('Creating password_resets table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        code VARCHAR(10),
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ password_resets table created\n');

    // 4. verification_codes table
    console.log('Creating verification_codes table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        token VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ verification_codes table created\n');

    // Verify all tables were created
    console.log('🔍 Verifying tables...\n');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('deleted_accounts', 'email_preferences', 'password_resets', 'verification_codes')
      ORDER BY table_name
    `);

    console.log('✅ Verification complete:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n✅ All missing tables created successfully!\n');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

createMissingTables();
