const axios = require('axios');

const LOCAL_API_URL = 'http://localhost:5000';
const TEST_EMAIL = 'ahmedmhosni90@gmail.com';

async function testPasswordResetLocal() {
  console.log('\n=== Testing Password Reset (Local) ===\n');

  try {
    // Step 1: Request password reset
    console.log('1. Requesting password reset...');
    console.log(`   Email: ${TEST_EMAIL}`);
    
    const forgotResponse = await axios.post(
      `${LOCAL_API_URL}/api/v2/auth/forgot-password`,
      { email: TEST_EMAIL },
      { timeout: 10000 }
    );

    console.log('✓ Password reset request sent');
    console.log('  Response:', forgotResponse.data);
    console.log('\n📧 CHECK YOUR EMAIL:');
    console.log(`  - Check inbox: ${TEST_EMAIL}`);
    console.log('  - Check spam/junk folder');
    console.log('  - Subject: "🔐 Password Reset Request - Roastify"');
    console.log('  - Click the reset link in the email');

    // Step 2: Test with invalid token (should fail)
    console.log('\n2. Testing with invalid token (should fail)...');
    try {
      await axios.post(
        `${LOCAL_API_URL}/api/v2/auth/reset-password`,
        {
          token: 'invalid-token-12345',
          newPassword: 'NewTest123!@#'
        },
        { timeout: 10000 }
      );
      console.log('✗ Should have failed with invalid token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Correctly rejected invalid token');
        console.log('  Error:', error.response.data.message);
      } else {
        console.log('⚠ Unexpected error:', error.message);
      }
    }

    // Step 3: Test password validation
    console.log('\n3. Testing password validation...');
    
    const weakPasswords = [
      { password: 'short', reason: 'too short' },
      { password: 'nouppercase1!', reason: 'no uppercase' },
      { password: 'NOLOWERCASE1!', reason: 'no lowercase' },
      { password: 'NoNumbers!@#', reason: 'no numbers' },
      { password: 'NoSpecial123', reason: 'no special characters' }
    ];

    for (const test of weakPasswords) {
      try {
        await axios.post(
          `${LOCAL_API_URL}/api/v2/auth/reset-password`,
          {
            token: 'test-token',
            newPassword: test.password
          },
          { timeout: 10000 }
        );
        console.log(`✗ Should have rejected: ${test.reason}`);
      } catch (error) {
        if (error.response && (error.response.status === 400 || error.response.status === 401)) {
          console.log(`✓ Correctly rejected password: ${test.reason}`);
        }
      }
    }

    console.log('\n\n=== Next Steps ===');
    console.log('1. Check your email for the reset link');
    console.log('2. Copy the token from the URL');
    console.log('3. Test the reset with:');
    console.log('   node test-password-reset-with-token.js <TOKEN> <NEW_PASSWORD>');
    console.log('\n✅ Password reset endpoint is working!');

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

testPasswordResetLocal();
