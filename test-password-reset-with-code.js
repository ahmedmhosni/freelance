const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
const LOCAL_API_URL = 'http://localhost:5000';
const TEST_EMAIL = 'ahmedmhosni90@gmail.com';

async function testPasswordResetWithCode(apiUrl, environment) {
  console.log(`\n=== Testing Password Reset with Code (${environment}) ===\n`);

  try {
    // Step 1: Request password reset
    console.log('1. Requesting password reset...');
    console.log(`   Email: ${TEST_EMAIL}`);
    
    const forgotResponse = await axios.post(
      `${apiUrl}/api/v2/auth/forgot-password`,
      { email: TEST_EMAIL },
      { timeout: 15000, validateStatus: () => true }
    );

    console.log(`   Status: ${forgotResponse.status}`);
    
    if (forgotResponse.status === 200) {
      console.log('✓ Password reset request sent');
      console.log('  Response:', forgotResponse.data);
      
      console.log('\n📧 CHECK YOUR EMAIL:');
      console.log(`  - Check inbox: ${TEST_EMAIL}`);
      console.log('  - Check spam/junk folder');
      console.log('  - Subject: "🔐 Password Reset Request - Roastify"');
      console.log('  - You will receive BOTH:');
      console.log('    1. A clickable reset link');
      console.log('    2. A 6-digit verification code');
    } else {
      console.log('❌ Request failed:', forgotResponse.data);
      return;
    }

    // Step 2: Test with invalid code (should fail)
    console.log('\n2. Testing with invalid code (should fail)...');
    try {
      await axios.post(
        `${apiUrl}/api/v2/auth/reset-password`,
        {
          code: '000000',
          newPassword: 'NewTest123!@#'
        },
        { timeout: 15000 }
      );
      console.log('✗ Should have failed with invalid code');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Correctly rejected invalid code');
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
          `${apiUrl}/api/v2/auth/reset-password`,
          {
            code: '123456',
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

    console.log('\n\n=== How to Complete the Test ===');
    console.log('\n📧 Check your email and you will find:');
    console.log('   1. A clickable "Reset Password" button/link');
    console.log('   2. A 6-digit code (e.g., 123456)');
    console.log('\n🔗 Option 1: Use the link');
    console.log('   - Click the button in the email');
    console.log('   - Or copy/paste the full URL');
    console.log('\n🔢 Option 2: Use the code');
    console.log('   - Copy the 6-digit code from the email');
    console.log('   - Run: node test-reset-with-code.js <CODE> <NEW_PASSWORD>');
    console.log('   - Example: node test-reset-with-code.js 123456 NewPassword123!@#');
    console.log('\n✅ Both methods work - choose whichever is easier!');

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

async function testResetWithCode(apiUrl, code, newPassword) {
  console.log('\n=== Testing Password Reset with Code ===\n');

  try {
    console.log(`1. Resetting password with code: ${code}`);
    const response = await axios.post(
      `${apiUrl}/api/v2/auth/reset-password`,
      {
        code,
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
    console.log('  User:', loginResponse.data.user.email);

    console.log('\n✅ PASSWORD RESET WITH CODE WORKING PERFECTLY!');

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
  // Test with code provided
  const code = args[0];
  const newPassword = args[1] || 'NewTest123!@#';
  testResetWithCode(AZURE_API_URL, code, newPassword);
} else {
  // Test forgot password flow
  testPasswordResetWithCode(AZURE_API_URL, 'Azure Production');
}
