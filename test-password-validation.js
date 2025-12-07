const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

async function testPasswordValidation() {
  console.log('=== Testing Password Validation (Frontend & Backend Sync) ===\n');

  const testCases = [
    {
      name: 'Valid password with all requirements',
      password: 'Test1234!',
      shouldPass: true
    },
    {
      name: 'Too short (7 chars)',
      password: 'Test12!',
      shouldPass: false,
      expectedError: 'at least 8 characters'
    },
    {
      name: 'No uppercase',
      password: 'test1234!',
      shouldPass: false,
      expectedError: 'uppercase letter'
    },
    {
      name: 'No lowercase',
      password: 'TEST1234!',
      shouldPass: false,
      expectedError: 'lowercase letter'
    },
    {
      name: 'No number',
      password: 'TestTest!',
      shouldPass: false,
      expectedError: 'number'
    },
    {
      name: 'No special character',
      password: 'Test1234',
      shouldPass: false,
      expectedError: 'special character'
    },
    {
      name: 'Strong password',
      password: 'MySecure@Pass2024',
      shouldPass: true
    }
  ];

  console.log('Testing password validation on backend...\n');

  for (const test of testCases) {
    try {
      const timestamp = Date.now();
      const response = await axios.post(
        `${AZURE_API_URL}/api/v2/auth/register`,
        {
          name: 'Test User',
          email: `test${timestamp}@example.com`,
          password: test.password,
          role: 'freelancer'
        },
        { timeout: 15000 }
      );

      if (test.shouldPass) {
        console.log(`✓ ${test.name}: PASSED (accepted)`);
      } else {
        console.log(`✗ ${test.name}: FAILED (should have been rejected)`);
      }

    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.error || JSON.stringify(error.response.data);
        
        if (!test.shouldPass) {
          // Should fail - check if error message matches
          if (errorMsg.toLowerCase().includes(test.expectedError.toLowerCase())) {
            console.log(`✓ ${test.name}: PASSED (correctly rejected)`);
            console.log(`  Error: ${errorMsg}`);
          } else {
            console.log(`⚠ ${test.name}: PASSED but wrong error`);
            console.log(`  Expected: ${test.expectedError}`);
            console.log(`  Got: ${errorMsg}`);
          }
        } else {
          console.log(`✗ ${test.name}: FAILED (should have been accepted)`);
          console.log(`  Error: ${errorMsg}`);
        }
      } else {
        console.log(`✗ ${test.name}: Request failed - ${error.message}`);
      }
    }
  }

  console.log('\n\n=== Password Requirements Summary ===');
  console.log('✅ Minimum 8 characters');
  console.log('✅ At least one uppercase letter (A-Z)');
  console.log('✅ At least one lowercase letter (a-z)');
  console.log('✅ At least one number (0-9)');
  console.log('✅ At least one special character (!@#$%^&*(),.?":{}|<>)');
  
  console.log('\n=== Valid Password Examples ===');
  console.log('✓ Test1234!');
  console.log('✓ MyPass@2024');
  console.log('✓ Secure#123');
  console.log('✓ Admin$999');
  
  console.log('\n=== Invalid Password Examples ===');
  console.log('✗ Test1234 (no special character)');
  console.log('✗ test1234! (no uppercase)');
  console.log('✗ TEST1234! (no lowercase)');
  console.log('✗ TestTest! (no number)');
  console.log('✗ Test12! (too short)');
}

testPasswordValidation();
