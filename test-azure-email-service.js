const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
const LOCAL_API_URL = 'http://localhost:5000';

// Test with your actual email
const TEST_EMAIL = 'your-email@example.com'; // CHANGE THIS TO YOUR EMAIL

async function testEmailService(apiUrl, environment) {
  console.log(`\n=== Testing Email Service (${environment}) ===\n`);

  try {
    // Test 1: Register a new user (should send verification email)
    console.log('1. Testing Registration Email...');
    const timestamp = Date.now();
    const testUser = {
      name: 'Email Test User',
      email: `test${timestamp}@example.com`, // Use a test email
      password: 'Test1234',
      role: 'freelancer'
    };

    try {
      const registerResponse = await axios.post(
        `${apiUrl}/api/auth/register`,
        testUser,
        { timeout: 15000 }
      );

      if (registerResponse.data.success) {
        console.log('✓ Registration successful');
        console.log('  Check if verification email was sent to:', testUser.email);
        console.log('  Response:', registerResponse.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.log('✗ Registration failed:', error.response.data);
      } else {
        console.log('✗ Request failed:', error.message);
      }
    }

    // Test 2: Request password reset (should send reset email)
    console.log('\n2. Testing Password Reset Email...');
    try {
      const resetResponse = await axios.post(
        `${apiUrl}/api/auth/forgot-password`,
        { email: 'admin@roastify.com' },
        { timeout: 15000 }
      );

      console.log('✓ Password reset request sent');
      console.log('  Response:', resetResponse.data);
      console.log('  Check if reset email was sent to: admin@roastify.com');
    } catch (error) {
      if (error.response) {
        console.log('✗ Password reset failed:', error.response.data);
      } else {
        console.log('✗ Request failed:', error.message);
      }
    }

    // Test 3: Check email configuration
    console.log('\n3. Checking Email Configuration...');
    console.log('Expected environment variables:');
    console.log('  AZURE_COMMUNICATION_CONNECTION_STRING: Set ✓');
    console.log('  EMAIL_FROM: donotreply@roastify.online');
    console.log('  FRONTEND_URL: https://roastify.online');
    console.log('  EMAIL_VERIFICATION_EXPIRY: 1h');
    console.log('  PASSWORD_RESET_EXPIRY: 1h');

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

async function checkAzureCommunicationServices() {
  console.log('\n=== Azure Communication Services Check ===\n');
  
  console.log('Configuration:');
  console.log('  Connection String: endpoint=https://roastifyemail.europe.communication.azure.com/...');
  console.log('  Sender Email: donotreply@roastify.online');
  console.log('  Domain: roastify.online');
  
  console.log('\n⚠ Important Checks:');
  console.log('  1. Is the domain "roastify.online" verified in Azure Communication Services?');
  console.log('  2. Is the sender email "donotreply@roastify.online" configured?');
  console.log('  3. Are SPF and DKIM records configured for the domain?');
  console.log('  4. Is the Azure Communication Services resource active?');
  
  console.log('\nTo verify in Azure Portal:');
  console.log('  1. Go to Azure Communication Services resource');
  console.log('  2. Check "Email" > "Domains"');
  console.log('  3. Verify domain status is "Verified"');
  console.log('  4. Check "Email" > "Sender Authentication"');
}

async function main() {
  console.log('=== Azure Email Service Testing ===');
  console.log('This will test email sending on both local and Azure production\n');

  // Check Azure Communication Services configuration
  await checkAzureCommunicationServices();

  // Test on Azure production
  await testEmailService(AZURE_API_URL, 'Azure Production');

  // Optionally test locally
  // await testEmailService(LOCAL_API_URL, 'Local');

  console.log('\n\n=== Summary ===');
  console.log('1. Check your email inbox for verification and reset emails');
  console.log('2. Check Azure Communication Services logs in Azure Portal');
  console.log('3. Check backend logs for email sending errors');
  console.log('\nIf emails are not arriving:');
  console.log('  - Verify domain in Azure Communication Services');
  console.log('  - Check spam/junk folder');
  console.log('  - Verify sender email is configured');
  console.log('  - Check Azure Communication Services quotas and limits');
}

main();
