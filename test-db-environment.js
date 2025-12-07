/**
 * Test Database Environment Detection
 * 
 * This script tests that the database configuration correctly
 * detects and uses the appropriate database based on environment.
 */

console.log('='.repeat(80));
console.log('DATABASE ENVIRONMENT DETECTION TEST');
console.log('='.repeat(80));

// Test 1: Check current environment
console.log('\n1. Current Environment:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('   WEBSITE_INSTANCE_ID:', process.env.WEBSITE_INSTANCE_ID || 'undefined');

const isProduction = process.env.NODE_ENV === 'production';
const isAzure = process.env.WEBSITE_INSTANCE_ID !== undefined;

console.log('   Detected as:', isProduction || isAzure ? 'PRODUCTION' : 'DEVELOPMENT');

// Test 2: Check available database variables
console.log('\n2. Database Variables:');
console.log('   Local (PG_*):');
console.log('     PG_HOST:', process.env.PG_HOST || 'undefined');
console.log('     PG_DATABASE:', process.env.PG_DATABASE || 'undefined');
console.log('     PG_USER:', process.env.PG_USER || 'undefined');

console.log('   Production (DB_*):');
console.log('     DB_HOST:', process.env.DB_HOST || 'undefined');
console.log('     DB_NAME:', process.env.DB_NAME || 'undefined');
console.log('     DB_USER:', process.env.DB_USER || 'undefined');

// Test 3: Load database module and check connection
console.log('\n3. Loading Database Module...');

try {
  const db = require('./backend/src/db/postgresql');
  
  console.log('   ✓ Database module loaded successfully');
  
  // Test 4: Try to connect
  console.log('\n4. Testing Database Connection...');
  
  db.query('SELECT NOW() as current_time, version() as pg_version')
    .then(result => {
      console.log('   ✓ Connection successful!');
      console.log('   Current Time:', result.rows[0].current_time);
      console.log('   PostgreSQL Version:', result.rows[0].pg_version.split(',')[0]);
      
      // Test 5: Check if we're connected to the right database
      return db.query('SELECT current_database() as db_name');
    })
    .then(result => {
      console.log('\n5. Connected Database:');
      console.log('   Database Name:', result.rows[0].db_name);
      
      console.log('\n' + '='.repeat(80));
      console.log('✓ ALL TESTS PASSED');
      console.log('='.repeat(80));
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n' + '='.repeat(80));
      console.error('✗ CONNECTION FAILED');
      console.error('='.repeat(80));
      console.error('\nError:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('\nTroubleshooting:');
        console.error('  - Is PostgreSQL running?');
        console.error('  - Check host and port in your .env.local file');
      } else if (error.code === '28P01') {
        console.error('\nTroubleshooting:');
        console.error('  - Check database password in your .env.local file');
      } else if (error.code === '3D000') {
        console.error('\nTroubleshooting:');
        console.error('  - Database does not exist');
        console.error('  - Create it with: CREATE DATABASE roastify;');
      }
      
      process.exit(1);
    });
} catch (error) {
  console.error('\n✗ Failed to load database module');
  console.error('Error:', error.message);
  process.exit(1);
}
