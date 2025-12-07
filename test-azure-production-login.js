const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

async function testLogin() {
  console.log('Testing Azure Production Login...\n');

  const credentials = {
    email: 'admin@roastify.com',
    password: 'Test1234'
  };

  try {
    console.log('Attempting login with:', credentials.email);
    
    const response = await axios.post(
      `${AZURE_API_URL}/api/auth/login`,
      credentials,
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Login successful!');
    console.log('\nResponse:');
    console.log('- Success:', response.data.success);
    console.log('- User:', response.data.user);
    console.log('- Token:', response.data.token ? 'Present' : 'Missing');

    // Test authenticated request
    console.log('\n\nTesting authenticated request...');
    const meResponse = await axios.get(
      `${AZURE_API_URL}/api/auth/me`,
      {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      }
    );

    console.log('✓ Authenticated request successful!');
    console.log('User data:', meResponse.data.user);

  } catch (error) {
    console.log('✗ Login failed!');
    
    if (error.response) {
      console.log('\nError Response:');
      console.log('- Status:', error.response.status);
      console.log('- Data:', error.response.data);
    } else if (error.request) {
      console.log('\nNo response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('\nError:', error.message);
    }
  }
}

testLogin();
