/**
 * PostgreSQL Password Tester
 * Tests different common passwords to find the correct one
 */

const { Pool } = require('pg');

const commonPasswords = [
  'admin',
  'postgres',
  'password',
  'root',
  '123456',
  'postgres123',
  '',  // empty password
];

async function testPassword(password) {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Connect to default postgres database
    user: 'postgres',
    password: password,
    connectionTimeoutMillis: 3000,
  });

  try {
    await pool.query('SELECT NOW()');
    await pool.end();
    return true;
  } catch (error) {
    await pool.end();
    return false;
  }
}

async function findPassword() {
  console.log('='.repeat(60));
  console.log('PostgreSQL Password Finder');
  console.log('='.repeat(60));
  console.log('\nTesting common passwords...\n');

  for (const password of commonPasswords) {
    const displayPassword = password === '' ? '(empty)' : password;
    process.stdout.write(`Testing password: ${displayPassword.padEnd(15)} ... `);
    
    const works = await testPassword(password);
    
    if (works) {
      console.log('✓ SUCCESS!');
      console.log('\n' + '='.repeat(60));
      console.log('FOUND WORKING PASSWORD!');
      console.log('='.repeat(60));
      console.log(`\nYour PostgreSQL password is: ${displayPassword}`);
      console.log('\nUpdate your backend/.env file:');
      console.log(`PG_PASSWORD=${password}`);
      console.log('\n' + '='.repeat(60));
      return;
    } else {
      console.log('✗ Failed');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('No common password worked.');
  console.log('='.repeat(60));
  console.log('\nPlease enter your PostgreSQL password manually:');
  console.log('1. Find your PostgreSQL password');
  console.log('2. Update backend/.env file:');
  console.log('   PG_PASSWORD=your-actual-password');
  console.log('\nOr reset your PostgreSQL password:');
  console.log('1. Open pgAdmin or psql');
  console.log('2. Run: ALTER USER postgres PASSWORD \'newpassword\';');
  console.log('3. Update backend/.env with the new password');
}

findPassword().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
