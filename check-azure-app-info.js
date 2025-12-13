/**
 * Azure App Service Information Checker
 * This script helps identify the correct Azure app name and configuration
 */

console.log('🔍 Azure App Service Information Check');
console.log('=====================================');

// From DNS lookup, we know:
console.log('📍 DNS Information:');
console.log('   Custom Domain: api.roastify.online');
console.log('   Points to: roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net');
console.log('   IP Address: 40.89.19.0');
console.log('');

console.log('🔧 GitHub Actions Configuration Issues:');
console.log('   Current AZURE_WEBAPP_NAME: roastify-webapp-api');
console.log('   Actual Azure App Name: roastify-webapp-api-c0hgg2h4f4djcwaf');
console.log('   Publish Profile Secret: AZURE_WEBAPP_PUBLISH_PROFILE');
console.log('');

console.log('❌ Problem:');
console.log('   The publish profile secret was generated for the actual app name');
console.log('   (roastify-webapp-api-c0hgg2h4f4djcwaf) but the workflow is using');
console.log('   a different name (roastify-webapp-api)');
console.log('');

console.log('✅ Solutions:');
console.log('   Option 1: Update workflow to use correct app name');
console.log('   Option 2: Generate new publish profile for simplified name');
console.log('   Option 3: Use Azure CLI deployment instead of publish profile');
console.log('');

console.log('🎯 Recommended Action:');
console.log('   1. Go to Azure Portal');
console.log('   2. Navigate to App Service: roastify-webapp-api-c0hgg2h4f4djcwaf');
console.log('   3. Download the publish profile');
console.log('   4. Update GitHub secret AZURE_WEBAPP_PUBLISH_PROFILE with new content');
console.log('   5. Update workflow AZURE_WEBAPP_NAME to: roastify-webapp-api-c0hgg2h4f4djcwaf');
console.log('');

console.log('🔗 URLs to test after fix:');
console.log('   Direct: https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/health');
console.log('   Custom: https://api.roastify.online/api/health');
console.log('');

console.log('📋 Current Environment Variables Needed:');
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_DATABASE',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET'
];

requiredEnvVars.forEach(envVar => {
  console.log(`   ${envVar}: ${process.env[envVar] ? '✅ Set' : '❌ Missing'}`);
});