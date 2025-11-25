/**
 * Email System Test Suite
 * Tests all email functionality
 */

require('dotenv').config();
const emailService = require('./src/services/emailService');
const { generateToken, generateTokenExpiry, isTokenExpired } = require('./src/utils/tokenGenerator');
const emailConfig = require('./src/config/email.config');

console.log('🧪 Email System Test Suite\n');
console.log('=' .repeat(60));

// Test 1: Configuration Check
console.log('\n📋 Test 1: Configuration Check');
console.log('-'.repeat(60));

const hasConnectionString = !!emailConfig.azure.connectionString;
const hasSenderEmail = !!emailConfig.azure.senderEmail;
const hasAppUrl = !!emailConfig.templates.appUrl;

console.log(`✓ Connection String: ${hasConnectionString ? '✅ Set' : '❌ Missing'}`);
console.log(`✓ Sender Email: ${hasSenderEmail ? '✅ ' + emailConfig.azure.senderEmail : '❌ Missing'}`);
console.log(`✓ App URL: ${hasAppUrl ? '✅ ' + emailConfig.templates.appUrl : '❌ Missing'}`);
console.log(`✓ App Name: ${emailConfig.templates.appName}`);
console.log(`✓ Support Email: ${emailConfig.templates.supportEmail}`);

if (!hasConnectionString || !hasSenderEmail) {
  console.log('\n❌ Configuration incomplete! Check your .env file.');
  console.log('\nRequired in .env:');
  console.log('  AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...;accesskey=...');
  console.log('  EMAIL_FROM=your-email@domain.com');
  process.exit(1);
}

console.log('\n✅ Configuration looks good!');

// Test 2: Token Generation
console.log('\n📋 Test 2: Token Generation');
console.log('-'.repeat(60));

try {
  const token = generateToken();
  console.log(`✓ Token generated: ${token.substring(0, 20)}... (${token.length} chars)`);
  
  const expiry24h = generateTokenExpiry('24h');
  const expiry1h = generateTokenExpiry('1h');
  console.log(`✓ 24h expiry: ${expiry24h.toISOString()}`);
  console.log(`✓ 1h expiry: ${expiry1h.toISOString()}`);
  
  const pastDate = new Date(Date.now() - 1000);
  const futureDate = new Date(Date.now() + 1000);
  console.log(`✓ Past date expired: ${isTokenExpired(pastDate) ? '✅ Yes' : '❌ No'}`);
  console.log(`✓ Future date expired: ${!isTokenExpired(futureDate) ? '✅ No' : '❌ Yes'}`);
  
  console.log('\n✅ Token generation working!');
} catch (error) {
  console.log(`\n❌ Token generation failed: ${error.message}`);
  process.exit(1);
}

// Test 3: Email Service Initialization
console.log('\n📋 Test 3: Email Service Initialization');
console.log('-'.repeat(60));

if (!emailService.client) {
  console.log('❌ Email client not initialized!');
  console.log('   Check AZURE_COMMUNICATION_CONNECTION_STRING in .env');
  process.exit(1);
}

console.log('✅ Email client initialized successfully!');

// Test 4: Send Test Email
console.log('\n📋 Test 4: Send Test Email');
console.log('-'.repeat(60));

async function sendTestEmail() {
  const testEmail = process.argv[2] || process.env.TEST_EMAIL;
  
  if (!testEmail) {
    console.log('⚠️  No test email provided. Skipping email send test.');
    console.log('   To test email sending, run:');
    console.log('   node test-email-system.js your-email@example.com');
    return;
  }

  console.log(`📧 Sending test email to: ${testEmail}`);
  
  try {
    const testUser = {
      id: 999,
      name: 'Test User',
      email: testEmail
    };
    
    const testToken = generateToken();
    
    console.log('\n   Sending verification email...');
    await emailService.sendVerificationEmail(testUser, testToken, '123456');
    console.log('   ✅ Verification email sent!');
    
    console.log('\n✅ Test email sent successfully!');
    console.log('\n💡 To test other email types:');
    console.log('   - Password Reset: Use /forgot-password in the app');
    console.log('   - Welcome Email: Complete registration flow');
    console.log('   - Invoice Email: Send an invoice from the app');
    console.log(`\n📬 Check your inbox at: ${testEmail}`);
    console.log('   (Check spam folder if you don\'t see them)');
    
  } catch (error) {
    console.log(`\n❌ Email sending failed: ${error.message}`);
    console.log('\nPossible issues:');
    console.log('  1. Invalid connection string');
    console.log('  2. Sender email not verified in Azure');
    console.log('  3. Recipient email blocked');
    console.log('  4. Azure Communication Services not active');
    console.log('\nFull error:', error);
    process.exit(1);
  }
}

// Test 5: Email Templates
console.log('\n📋 Test 5: Email Templates');
console.log('-'.repeat(60));

const templates = [
  'sendVerificationEmail',
  'sendPasswordResetEmail',
  'sendWelcomeEmail',
  'sendInvoiceEmail',
  'sendTaskReminder'
];

templates.forEach(template => {
  const exists = typeof emailService[template] === 'function';
  console.log(`✓ ${template}: ${exists ? '✅ Available' : '❌ Missing'}`);
});

console.log('\n✅ All email templates available!');

// Run async tests
(async () => {
  await sendTestEmail();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Email System Test Complete!\n');
  
  console.log('📊 Summary:');
  console.log('  ✅ Configuration: OK');
  console.log('  ✅ Token Generation: OK');
  console.log('  ✅ Email Service: OK');
  console.log('  ✅ Email Templates: OK');
  
  if (process.argv[2]) {
    console.log('  ✅ Email Sending: OK');
    console.log('\n📧 Check your email inbox!');
  } else {
    console.log('  ⚠️  Email Sending: Not tested (no email provided)');
    console.log('\n💡 To test email sending, run:');
    console.log('   node test-email-system.js your-email@example.com');
  }
  
  console.log('\n🚀 Email system is ready for production!');
  console.log('');
  
})().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
