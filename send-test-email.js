const axios = require('axios');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
const TEST_EMAIL = 'ahmedmhosni90@gmail.com';

async function sendTestEmails() {
  console.log('=== Sending Test Emails to ahmedmhosni90@gmail.com ===\n');

  // Test 1: Register with your email (will send verification email)
  console.log('1. Registering user to trigger verification email...');
  try {
    const timestamp = Date.now();
    const registerResponse = await axios.post(
      `${AZURE_API_URL}/api/auth/register`,
      {
        name: 'Ahmed Test',
        email: `ahmed.test${timestamp}@example.com`, // Using a test email first
        password: 'Test1234',
        role: 'freelancer'
      },
      { timeout: 15000 }
    );

    console.log('✓ Registration successful');
    console.log('  Response:', registerResponse.data.message);
    console.log('  Note: Email sent to test address, not your Gmail');
  } catch (error) {
    if (error.response) {
      console.log('✗ Registration failed:', error.response.status);
      console.log('  Error:', error.response.data);
    } else {
      console.log('✗ Request failed:', error.message);
    }
  }

  // Test 2: Request password reset for admin account
  console.log('\n2. Requesting password reset for admin account...');
  try {
    const resetResponse = await axios.post(
      `${AZURE_API_URL}/api/auth/forgot-password`,
      { email: 'admin@roastify.com' },
      { timeout: 15000 }
    );

    console.log('✓ Password reset request sent');
    console.log('  Response:', resetResponse.data);
    console.log('  Check if email was sent to: admin@roastify.com');
  } catch (error) {
    if (error.response) {
      console.log('✗ Password reset failed:', error.response.status);
      console.log('  Error:', error.response.data);
    } else {
      console.log('✗ Request failed:', error.message);
    }
  }

  // Test 3: Try to register with your actual Gmail
  console.log('\n3. Attempting to register with your Gmail address...');
  console.log('   This will send a verification email to: ahmedmhosni90@gmail.com');
  
  try {
    const timestamp = Date.now();
    const gmailRegisterResponse = await axios.post(
      `${AZURE_API_URL}/api/auth/register`,
      {
        name: 'Ahmed Hosni',
        email: TEST_EMAIL,
        password: 'Test1234',
        role: 'freelancer'
      },
      { timeout: 15000 }
    );

    console.log('✓ Registration successful!');
    console.log('  Response:', gmailRegisterResponse.data.message);
    console.log('\n📧 CHECK YOUR EMAIL: ahmedmhosni90@gmail.com');
    console.log('  - Check inbox for verification email');
    console.log('  - Check spam/junk folder if not in inbox');
    console.log('  - Email subject: "Verify your Roastify account"');
    console.log('  - Sender: donotreply@roastify.online');
  } catch (error) {
    if (error.response) {
      console.log('✗ Registration failed:', error.response.status);
      console.log('  Error:', error.response.data);
      
      if (error.response.status === 409) {
        console.log('\n  ℹ Email already registered. Trying password reset instead...');
        
        // If already registered, try password reset
        try {
          const resetResponse = await axios.post(
            `${AZURE_API_URL}/api/auth/forgot-password`,
            { email: TEST_EMAIL },
            { timeout: 15000 }
          );

          console.log('  ✓ Password reset email sent!');
          console.log('  Response:', resetResponse.data);
          console.log('\n📧 CHECK YOUR EMAIL: ahmedmhosni90@gmail.com');
          console.log('  - Check inbox for password reset email');
          console.log('  - Check spam/junk folder if not in inbox');
          console.log('  - Email subject: "Reset your Roastify password"');
          console.log('  - Sender: donotreply@roastify.online');
        } catch (resetError) {
          if (resetError.response) {
            console.log('  ✗ Password reset also failed:', resetError.response.data);
          } else {
            console.log('  ✗ Password reset request failed:', resetError.message);
          }
        }
      }
    } else {
      console.log('✗ Request failed:', error.message);
    }
  }

  console.log('\n\n=== Email Service Status ===');
  console.log('If you did NOT receive any emails, the issue is likely:');
  console.log('  1. Domain "roastify.online" is not verified in Azure Communication Services');
  console.log('  2. Sender email "donotreply@roastify.online" is not configured');
  console.log('  3. DNS records (SPF, DKIM) are not set up');
  console.log('\nSolution:');
  console.log('  - Follow the guide in AZURE_EMAIL_SETUP_GUIDE.md');
  console.log('  - Or use Azure managed domain for immediate testing');
  console.log('\nTo check Azure Communication Services:');
  console.log('  1. Go to Azure Portal');
  console.log('  2. Navigate to Communication Services > roastifyemail');
  console.log('  3. Check Email > Domains > Verify domain status');
  console.log('  4. Check Monitoring > Logs for email sending attempts');
}

sendTestEmails();
