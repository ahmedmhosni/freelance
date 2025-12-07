const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

async function testLogin() {
  console.log('=== Testing Azure Production Login ===\n');

  try {
    // Test login
    console.log('Attempting login...');
    const response = await axios.post(
      `${AZURE_API_URL}/api/auth/login`,
      {
        email: 'admin@roastify.com',
        password: 'Test1234'
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ LOGIN SUCCESSFUL!\n');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.token ? '✓ Present' : '✗ Missing');

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

    console.log('\n\n=== ALL TESTS PASSED ===');
    console.log('You can now login to the production site with:');
    console.log('Email: admin@roastify.com');
    console.log('Password: Test1234');

  } catch (error) {
    console.log('✗ LOGIN FAILED\n');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      if (error.response.status === 500) {
        console.log('\n⚠ Still getting 500 error. The Azure App Service may need to be restarted.');
        console.log('To restart:');
        console.log('1. Go to Azure Portal');
        console.log('2. Find "roastify-webapp-api" App Service');
        console.log('3. Click "Restart" button');
        console.log('4. Wait 1-2 minutes and try again');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
