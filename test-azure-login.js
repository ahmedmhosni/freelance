const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

async function testAzureLogin() {
  console.log('Testing Azure deployment login...\n');

  try {
    // Test 1: Check if API is responding
    console.log('1. Testing API health...');
    try {
      const healthResponse = await axios.get(`${AZURE_API_URL}/api/health`, {
        timeout: 10000
      });
      console.log('✓ API is responding:', healthResponse.data);
    } catch (error) {
      console.log('✗ API health check failed:', error.message);
    }

    // Test 2: Try to register a new user
    console.log('\n2. Attempting to register a test user...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test1234',
      role: 'freelancer'
    };

    try {
      const registerResponse = await axios.post(
        `${AZURE_API_URL}/api/auth/register`,
        testUser,
        { timeout: 10000 }
      );
      console.log('✓ Registration successful:', registerResponse.data);

      // Test 3: Try to login with the new user
      console.log('\n3. Attempting to login with new user...');
      const loginResponse = await axios.post(
        `${AZURE_API_URL}/api/auth/login`,
        {
          email: testUser.email,
          password: testUser.password
        },
        { timeout: 10000 }
      );
      console.log('✓ Login successful:', loginResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('✗ Request failed with status:', error.response.status);
        console.log('Error data:', error.response.data);
      } else {
        console.log('✗ Request failed:', error.message);
      }
    }

    // Test 4: Try to login with a common test account
    console.log('\n4. Attempting to login with common test credentials...');
    const commonCredentials = [
      { email: 'admin@example.com', password: 'Admin1234' },
      { email: 'test@example.com', password: 'Test1234' },
      { email: 'user@example.com', password: 'User1234' }
    ];

    for (const creds of commonCredentials) {
      try {
        const loginResponse = await axios.post(
          `${AZURE_API_URL}/api/auth/login`,
          creds,
          { timeout: 10000 }
        );
        console.log(`✓ Login successful with ${creds.email}:`, loginResponse.data);
        break;
      } catch (error) {
        if (error.response) {
          console.log(`✗ Login failed for ${creds.email}:`, error.response.status, error.response.data);
        } else {
          console.log(`✗ Login failed for ${creds.email}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testAzureLogin();
