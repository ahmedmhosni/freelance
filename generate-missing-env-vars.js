const crypto = require('crypto');

function generateSecureKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateEnvironmentVariables() {
  console.log('\n🔐 MISSING AZURE ENVIRONMENT VARIABLES');
  console.log('================================================================================');
  console.log('Copy and paste these into Azure App Service Configuration:');
  console.log('================================================================================\n');

  const envVars = {
    'JWT_REFRESH_SECRET': generateSecureKey(32),
    'SESSION_SECRET': generateSecureKey(32),
    'ENCRYPTION_KEY': generateSecureKey(32),
    'RATE_LIMIT_WINDOW_MS': '900000',
    'RATE_LIMIT_MAX_REQUESTS': '100'
  };

  // Output in Azure format
  console.log('🔧 FOR AZURE APP SERVICE CONFIGURATION:');
  console.log('================================================================================');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

  console.log('\n📋 JSON FORMAT (for Azure CLI or ARM templates):');
  console.log('================================================================================');
  const jsonFormat = Object.entries(envVars).map(([key, value]) => ({
    name: key,
    value: value,
    slotSetting: false
  }));
  console.log(JSON.stringify(jsonFormat, null, 2));

  console.log('\n💡 INSTRUCTIONS:');
  console.log('================================================================================');
  console.log('1. Go to Azure Portal → App Services → roastify-webapp-api');
  console.log('2. Click "Configuration" in the left menu');
  console.log('3. Click "New application setting" for each variable above');
  console.log('4. Copy the Name and Value from the list above');
  console.log('5. Click "Save" after adding all variables');
  console.log('6. Restart the web app');
  
  console.log('\n⚠️  SECURITY NOTE:');
  console.log('================================================================================');
  console.log('These are randomly generated secure keys. Store them safely!');
  console.log('If you lose these keys, you\'ll need to regenerate them.');
}

generateEnvironmentVariables();