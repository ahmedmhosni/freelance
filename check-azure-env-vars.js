const axios = require('axios');

async function checkAzureEnvironment() {
  console.log('\n🔍 AZURE ENVIRONMENT VARIABLES CHECK');
  console.log('================================================================================');
  
  try {
    // Test the backend to see what environment variables are being used
    const response = await axios.get('https://roastify-webapp-api.azurewebsites.net/api/health', {
      timeout: 30000
    });
    
    console.log('✅ Backend responded:', response.status);
    console.log('📊 Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Backend Error:', error.response.status);
      console.log('📊 Error Response:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timed out - backend might be starting up');
    } else {
      console.log('❌ Connection Error:', error.message);
    }
  }

  // Based on the provided environment variables, let's check what might be missing
  const providedEnvVars = [
    "APP_NAME", "APP_URL", "APPINSIGHTS_INSTRUMENTATIONKEY", "APPINSIGHTS_PROFILERFEATURE_VERSION",
    "APPINSIGHTS_SNAPSHOTFEATURE_VERSION", "APPLICATIONINSIGHTS_CONNECTION_STRING", 
    "ApplicationInsightsAgent_EXTENSION_VERSION", "AZURE_COMMUNICATION_CONNECTION_STRING",
    "AZURE_STORAGE_ACCOUNT_NAME", "AZURE_STORAGE_CONNECTION_STRING", "AZURE_STORAGE_CONTAINER_NAME",
    "DB_DATABASE", "DB_HOST", "DB_PASSWORD", "DB_PORT", "DB_SSL", "DB_USER",
    "DiagnosticServices_EXTENSION_VERSION", "EMAIL_FROM", "EMAIL_VERIFICATION_EXPIRY",
    "FRONTEND_URL", "GEMINI_API_KEY", "InstrumentationEngine_EXTENSION_VERSION",
    "JWT_EXPIRES_IN", "JWT_SECRET", "NODE_ENV", "PASSWORD_RESET_EXPIRY", "PORT",
    "SnapshotDebugger_EXTENSION_VERSION", "SUPPORT_EMAIL", "USE_AZURE_SQL", "USE_POSTGRES"
  ];

  console.log('\n📋 PROVIDED ENVIRONMENT VARIABLES:');
  console.log('================================================================================');
  providedEnvVars.forEach(envVar => {
    console.log(`✅ ${envVar}`);
  });

  // Check for missing critical environment variables
  const criticalEnvVars = [
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'ENCRYPTION_KEY',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS'
  ];

  console.log('\n⚠️  POTENTIALLY MISSING CRITICAL ENVIRONMENT VARIABLES:');
  console.log('================================================================================');
  criticalEnvVars.forEach(envVar => {
    console.log(`❌ ${envVar} - Not in provided list`);
  });

  console.log('\n🔧 RECOMMENDED AZURE ENVIRONMENT VARIABLES TO ADD:');
  console.log('================================================================================');
  console.log('JWT_REFRESH_SECRET=your-jwt-refresh-secret-here');
  console.log('SESSION_SECRET=your-session-secret-here');
  console.log('ENCRYPTION_KEY=your-encryption-key-here');
  console.log('RATE_LIMIT_WINDOW_MS=900000');
  console.log('RATE_LIMIT_MAX_REQUESTS=100');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('================================================================================');
  console.log('1. Add the missing environment variables to Azure App Service');
  console.log('2. Restart the Azure Web App');
  console.log('3. Monitor the logs for any remaining issues');
}

checkAzureEnvironment().catch(console.error);