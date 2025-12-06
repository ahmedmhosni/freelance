/**
 * Create Test User Script
 * Creates a test user for automated testing
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

const TEST_USER = {
  name: 'Test User',
  email: 'test@test.com',
  password: 'TestPassword123!'
};

async function createTestUser() {
  console.log('Creating test user...');
  console.log(`Email: ${TEST_USER.email}`);
  console.log(`Password: ${TEST_USER.password}`);
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, TEST_USER, {
      validateStatus: () => true
    });
    
    if (response.status === 201 || response.status === 200) {
      console.log('✓ Test user created successfully!');
      console.log('Response:', response.data);
      return true;
    } else if (response.status === 400 && response.data.message?.includes('already exists')) {
      console.log('✓ Test user already exists');
      return true;
    } else {
      console.log('✗ Failed to create test user');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('✗ Error creating test user:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\nTesting login with test user...');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data.token) {
      console.log('✓ Login successful!');
      console.log('Token received:', response.data.token.substring(0, 20) + '...');
      return response.data.token;
    } else {
      console.log('✗ Login failed');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('✗ Error during login:', error.message);
    return null;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║              Test User Setup                           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const created = await createTestUser();
  
  if (created) {
    const token = await testLogin();
    
    if (token) {
      console.log('\n✓ Test user is ready for automated testing!');
      console.log('\nCredentials:');
      console.log(`  Email: ${TEST_USER.email}`);
      console.log(`  Password: ${TEST_USER.password}`);
    }
  }
}

main().catch(console.error);
