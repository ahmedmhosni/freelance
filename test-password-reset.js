const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
const LOCAL_API_URL = 'http://localhost:5000';

const TEST_EMAIL = 'ahmedmhosni90@gmail.com';

async function testPasswordReset(apiUrl, environment) {
  console.log(`\n=== Testing Password Reset (${environment}) ===\n`);

  try {
    // Step 1: Request password reset
    console.log('1. Requesting password reset...');
    console.log(`   Email: ${TEST_EMAIL}`);
    
    const forgotResponse = await axios.post(
      `${apiUrl}/api/v2/auth/forgot-password`,
      { email: TEST_EMAIL },
      { timeout: 15000 }
    );

    console.log('✓ Password reset request sent');
    console.log('  Response:', forgotResponse.data);
    console.log('\n📧 CHECK YOUR EMAIL:');
    console.log(`  - Check inbox: ${TEST_EMAIL}`);
    console.log('  - Check spam/junk folder');
    console.log('  - Subject: "🔐 Password Reset Request - Roastify"');
    console.log('  - Click the reset link in the email');

    console.log('\n2. Waiting for you to check email...');
    console.log('   Copy the reset token from the email URL');
    console.log('   Example: https://roastify.online/reset-password?token=ABC123');
    console.log('   The token is the part after "token="');

    // Step 2: Test with invalid token (should fail)
    console.log('\n3. Testing with invalid token (should fail)...');
    try {
      await axios.post(
        `${apiUrl}/api/v2/auth/reset-password`,
        {
          token: 'invalid-token-12345',
          newPassword: 'NewTest1234'
        },
        { timeout: 15000 }
      );
      console.log('✗ Should have failed with invalid token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Correctly rejected invalid token');
      } else {
        console.log('⚠ Unexpected error:', error.message);
      }
    }

    // Step 3: Test password validation
    console.log('\n4. Testing password validation...');
    
    const weakPasswords = [
      { password: 'short', reason: 'too short' },
      { password: 'nouppercase1', reason: 'no uppercase' },
      { password: 'NOLOWERCASE1', reason: 'no lowercase' },
      { password: 'NoNumbers', reason: 'no numbers' }
    ];

    for (const test of weakPasswords) {
      try {
        await axios.post(
          `${apiUrl}/api/v2/auth/reset-password`,
          {
            token: 'test-token',
            newPassword: test.password
          },
          { timeout: 15000 }
        );
        console.log(`✗ Should have rejected: ${test.reason}`);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log(`✓ Correctly rejected password: ${test.reason}`);
        }
      }
    }

    console.log('\n\n=== Manual Testing Required ===');
    console.log('To complete the test:');
    console.log('1. Check your email for the reset link');
    console.log('2. Copy the token from the URL');
    console.log('3. Run this command with your token:');
    console.log('\nnode test-password-reset-with-token.js YOUR_TOKEN_HERE');

  } catch (error) {
    console.log('\n❌ Test failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function testWithToken(apiUrl, token, newPassword) {
  console.log('\n=== Testing Password Reset with Token ===\n');

  try {
    console.log('1. Resetting password with token...');
    const response = await axios.post(
      `${apiUrl}/api/v2/auth/reset-password`,
      {
        token,
        newPassword
      },
      { timeout: 15000 }
    );

    console.log('✓ Password reset successful!');
    console.log('  Response:', response.data);

    // Try to login with new password
    console.log('\n2. Testing login with new password...');
    const loginResponse = await axios.post(
      `${apiUrl}/api/v2/auth/login`,
      {
        email: TEST_EMAIL,
        password: newPassword
      },
      { timeout: 15000 }
    );

    console.log('✓ Login successful with new password!');
    console.log('  User:', loginResponse.data.user);

    console.log('\n✅ PASSWORD RESET FLOW WORKING CORRECTLY!');

  } catch (error) {
    console.log('\n❌ Test failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length >= 2) {
  // Test with token provided
  const token = args[0];
  const newPassword = args[1] || 'NewTest1234';
  testWithToken(AZURE_API_URL, token, newPassword);
} else {
  // Test forgot password flow
  testPasswordReset(AZURE_API_URL, 'Azure Production');
}
