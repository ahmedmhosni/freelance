// Add version names and major release flag to production
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
    console.log('🚀 Adding version names and major release flag to PRODUCTION');

    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/ADD_VERSION_NAMES.sql'),
      'utf8'
    );

    await pool.query(sql);

    console.log('✅ Production database updated!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
