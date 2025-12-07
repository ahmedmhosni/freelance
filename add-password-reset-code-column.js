const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

async function addColumn() {
  console.log('\n=== Adding Password Reset Code Column ===\n');
  
  try {
    // Check if column exists
    const checkResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'password_reset_code';
    `);

    if (checkResult.rows.length > 0) {
      console.log('✓ Column password_reset_code already exists');
    } else {
      console.log('Adding password_reset_code column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN password_reset_code VARCHAR(255);
      `);
      console.log('✅ Column added successfully!');
    }

    // Verify all password reset columns
    const verifyResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('password_reset_token', 'password_reset_code', 'password_reset_expires')
      ORDER BY column_name;
    `);

    console.log('\nPassword Reset Columns:');
    verifyResult.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name}: ${row.data_type}`);
    });

    if (verifyResult.rows.length === 3) {
      console.log('\n✅ All password reset columns are ready!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addColumn();
