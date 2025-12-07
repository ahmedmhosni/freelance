const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  console.log('\n=== Checking Azure Password Reset Schema ===\n');
  
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
      console.log('\nAdding columns now...');
      
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
        ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
      `);
      
      console.log('✅ Columns added successfully!');
    } else {
      result.rows.forEach(row => {
        console.log(`✓ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      if (result.rows.length === 2) {
        console.log('\n✅ All password reset columns exist!');
      } else {
        console.log('\n⚠️ Missing some columns, adding them...');
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
          ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
        `);
        console.log('✅ Columns added!');
      }
    }

    // Test the user exists
    const userCheck = await pool.query(`
      SELECT id, email, email_verified
      FROM users
      WHERE email = 'ahmedmhosni90@gmail.com';
    `);

    if (userCheck.rows.length > 0) {
      console.log('\nTest user found:');
      console.log(`  Email: ${userCheck.rows[0].email}`);
      console.log(`  ID: ${userCheck.rows[0].id}`);
      console.log(`  Email Verified: ${userCheck.rows[0].email_verified}`);
    } else {
      console.log('\n⚠️ Test user not found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
