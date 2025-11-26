const { Pool } = require('pg');
require('dotenv').config();

async function verifyAdmin() {
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'roastify_local',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    const result = await pool.query(`
      SELECT id, name, email, role, email_verified, is_active, created_at
      FROM users
      ORDER BY id
    `);

    console.log('\n═══════════════════════════════════════');
    console.log('USERS IN DATABASE');
    console.log('═══════════════════════════════════════\n');

    if (result.rows.length === 0) {
      console.log('⚠️  No users found\n');
    } else {
      result.rows.forEach(user => {
        console.log(`ID:              ${user.id}`);
        console.log(`Name:            ${user.name}`);
        console.log(`Email:           ${user.email}`);
        console.log(`Role:            ${user.role}`);
        console.log(`Email Verified:  ${user.email_verified}`);
        console.log(`Active:          ${user.is_active}`);
        console.log(`Created:         ${user.created_at.toISOString()}`);
        console.log('───────────────────────────────────────\n');
      });
    }

    console.log(`Total Users: ${result.rows.length}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyAdmin();
