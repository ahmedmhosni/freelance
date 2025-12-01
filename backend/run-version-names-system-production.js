// Create version names system in production
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    host: 'roastifydbpost.postgres.database.azure.com',
    port: 5432,
    database: 'roastifydb',
    user: 'adminuser',
    password: 'AHmed#123456',
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🚀 Creating version names system in PRODUCTION');

    const sql = fs.readFileSync(
      path.join(
        __dirname,
        '../database/migrations/CREATE_VERSION_NAMES_SYSTEM.sql'
      ),
      'utf8'
    );

    await pool.query(sql);

    console.log('✅ Production version names system created!');
    console.log('📊 46 coffee-themed names added');
    console.log('   - 17 minor names (roasting levels)');
    console.log('   - 29 major names (specialty drinks)');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
