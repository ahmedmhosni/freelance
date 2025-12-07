const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
const TEST_EMAIL = 'ahmedmhosni90@gmail.com';

async function testPasswordReset() {
  console.log('\n=== Testing Password Reset on Azure Production ===\n');

  try {
    console.log('1. Testing forgot-password endpoint...');
    console.log(`   URL: ${AZURE_API_URL}/api/v2/auth/forgot-password`);
    console.log(`   Email: ${TEST_EMAIL}`);
    
    const response = await axios.post(
      `${AZURE_API_URL}/api/v2/auth/forgot-password`,
      { email: TEST_EMAIL },
      { 
        timeout: 30000,
        validateStatus: () => true // Accept any status code
      }
    );

    console.log('\nResponse:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Headers:`, response.headers);
    console.log(`  Data:`, response.data);

    if (response.status === 200) {
      console.log('\n✅ Password reset request successful!');
      console.log('📧 Check your email for the reset link');
    } else {
      console.log('\n❌ Request failed');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.log('\n❌ Error occurred');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received');
      console.log('Request:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testPasswordReset();
