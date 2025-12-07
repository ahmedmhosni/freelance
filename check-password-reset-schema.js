const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkSchema() {
  console.log('\n=== Checking Password Reset Schema ===\n');
  
  try {
    // Check if password reset columns exist
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('password_reset_token', 'password_reset_expires')
      ORDER BY column_name;
    `);

    console.log('Password Reset Columns:');
    if (result.rows.length === 0) {
      console.log('❌ NO PASSWORD RESET COLUMNS FOUND!');
      console.log('\nYou need to add these columns:');
      console.log('ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);');
      console.log('ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;');
    } else {
      result.rows.forEach(row => {
        console.log(`✓ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      if (result.rows.length === 2) {
        console.log('\n✅ All password reset columns exist!');
      } else {
        console.log('\n⚠️ Missing some columns!');
      }
    }

    // Check a sample user
    const userCheck = await pool.query(`
      SELECT id, email, password_reset_token, password_reset_expires
      FROM users
      LIMIT 1;
    `);

    if (userCheck.rows.length > 0) {
      console.log('\nSample user structure:');
      console.log(userCheck.rows[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
