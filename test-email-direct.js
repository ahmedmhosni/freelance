/**
 * Direct Email Service Test
 * This tests the email service directly using Azure Communication Services
 */

const { EmailClient } = require('@azure/communication-email');

const config = {
  connectionString: 'endpoint=https://roastifyemail.europe.communication.azure.com/;accesskey=5n3xW27OBEh5mK0tQm9gnafnqkaFsyP2ErqH8EnEDV5ToU3aYFvsJQQJ99BKACULyCptyCYmAAAAAZCSEYcP',
  senderEmail: 'donotreply@roastify.online',
  recipientEmail: 'ahmedmhosni90@gmail.com'
};

async function testEmailDirect() {
  console.log('=== Direct Azure Communication Services Email Test ===\n');
  console.log('Configuration:');
  console.log('  Sender:', config.senderEmail);
  console.log('  Recipient:', config.recipientEmail);
  console.log('  Endpoint: roastifyemail.europe.communication.azure.com\n');

  try {
    console.log('1. Initializing Email Client...');
    const emailClient = new EmailClient(config.connectionString);
    console.log('✓ Email client initialized\n');

    console.log('2. Preparing test email...');
    const message = {
      senderAddress: config.senderEmail,
      headers: {
        'From': `Roastify <${config.senderEmail}>`
      },
      content: {
        subject: '✉️ Test Email - Roastify Email Service Verification',
        plainText: 'This is a test email from your Roastify application to verify Azure Communication Services is working correctly.',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #37352f; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f8f9fa; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Test Email from Roastify</h1>
              </div>
              <div class="content">
                <h2>Email Service Test</h2>
                <p>This is a test email to verify that Azure Communication Services is configured correctly.</p>
                <p><strong>If you received this email, your email service is working! ✓</strong></p>
                <p>Configuration details:</p>
                <ul>
                  <li>Sender: ${config.senderEmail}</li>
                  <li>Service: Azure Communication Services</li>
                  <li>Region: Europe</li>
                  <li>Timestamp: ${new Date().toISOString()}</li>
                </ul>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Roastify. All rights reserved.</p>
                <p>This is an automated test email.</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      recipients: {
        to: [{ address: config.recipientEmail }]
      }
    };

    console.log('✓ Email message prepared\n');

    console.log('3. Sending email...');
    console.log('   This may take 10-30 seconds...\n');
    
    const poller = await emailClient.beginSend(message);
    console.log('✓ Email send operation started');
    console.log('  Operation ID:', poller.getOperationState().id);
    
    console.log('\n4. Waiting for email to be sent...');
    const result = await poller.pollUntilDone();
    
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('Result:');
    console.log('  Message ID:', result.id);
    console.log('  Status:', result.status);
    console.log('  Recipient:', config.recipientEmail);
    
    console.log('\n📧 CHECK YOUR EMAIL:');
    console.log('  1. Check inbox: ahmedmhosni90@gmail.com');
    console.log('  2. Check spam/junk folder if not in inbox');
    console.log('  3. Email subject: "Test Email from Roastify"');
    console.log('  4. Sender: donotreply@roastify.online');
    
    console.log('\n✓ Email service is working correctly!');

  } catch (error) {
    console.log('\n❌ EMAIL SEND FAILED\n');
    console.log('Error:', error.message);
    
    if (error.code) {
      console.log('Error Code:', error.code);
    }
    
    if (error.statusCode) {
      console.log('Status Code:', error.statusCode);
    }

    console.log('\n🔍 Troubleshooting:');
    
    if (error.message.includes('domain')) {
      console.log('  ❌ Domain Issue:');
      console.log('     - Domain "roastify.online" is not verified');
      console.log('     - Go to Azure Portal > Communication Services > Email > Domains');
      console.log('     - Verify domain status');
      console.log('     - Add required DNS records (TXT, SPF, DKIM)');
    }
    
    if (error.message.includes('sender')) {
      console.log('  ❌ Sender Email Issue:');
      console.log('     - Sender email "donotreply@roastify.online" not configured');
      console.log('     - Add sender email in Azure Communication Services');
    }
    
    if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      console.log('  ❌ Authentication Issue:');
      console.log('     - Connection string might be invalid');
      console.log('     - Check AZURE_COMMUNICATION_CONNECTION_STRING');
    }

    console.log('\n💡 Quick Fix:');
    console.log('  Use Azure Managed Domain instead:');
    console.log('  1. Go to Azure Portal > Communication Services');
    console.log('  2. Email > Domains > Add domain > Azure managed domain');
    console.log('  3. Use the provided domain (e.g., xxxxx.azurecomm.net)');
    console.log('  4. Update EMAIL_FROM environment variable');
    console.log('  5. Restart and test again');
  }
}

// Check if @azure/communication-email is installed
try {
  require.resolve('@azure/communication-email');
  testEmailDirect();
} catch (e) {
  console.log('❌ Package @azure/communication-email is not installed');
  console.log('\nInstall it with:');
  console.log('  npm install @azure/communication-email');
  console.log('\nOr run from backend directory:');
  console.log('  cd backend');
  console.log('  node ../test-email-direct.js');
}
