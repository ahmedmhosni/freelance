/**
 * Verify Test User Email
 * Directly verifies the test user's email in the database
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123'
});

async function verifyTestUser() {
  console.log('Verifying test user email...');
  
  try {
    const result = await pool.query(
      `UPDATE users SET email_verified = true WHERE email = 'test@test.com' RETURNING id, email, email_verified`
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Test user email verified!');
      console.log('User:', result.rows[0]);
      return true;
    } else {
      console.log('✗ Test user not found');
      return false;
    }
  } catch (error) {
    console.log('✗ Error verifying user:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

verifyTestUser().catch(console.error);
