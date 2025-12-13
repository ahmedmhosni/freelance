const https = require('https');

console.log('🔍 Testing All Missing API Endpoints');
console.log('===================================');

const endpoints = [
  // Original missing endpoints
  '/api/time-tracking/running',
  '/api/tasks',
  '/api/notifications', 
  '/api/projects',
  '/api/clients',
  '/api/invoices',
  '/api/time-tracking',
  
  // Admin endpoints
  '/api/admin/reports',
  '/api/admin/users',
  '/api/admin/activity/stats',
  '/api/admin/gdpr/export-requests',
  
  // Legal endpoints
  '/api/legal/terms',
  '/api/legal/privacy',
  
  // AI Admin endpoints (disabled)
  '/api/ai/admin/settings',
  '/api/ai/admin/usage',
  
  // Status endpoint
  '/api/status'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.roastify.online',
      port: 443,
      path: endpoint,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          endpoint,
          status: res.statusCode,
          body: data.substring(0, 150) // First 150 chars
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint,
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        endpoint,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🌐 Base URL: https://api.roastify.online\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    if (result.status === 200) {
      console.log(`✅ ${endpoint.padEnd(35)} | 200 OK | ${result.body.replace(/\n/g, ' ')}`);
      successCount++;
    } else if (result.status === 404) {
      console.log(`❌ ${endpoint.padEnd(35)} | 404 Not Found`);
      failCount++;
    } else {
      console.log(`🔶 ${endpoint.padEnd(35)} | ${result.status} | ${result.error || result.body}`);
      failCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Working: ${successCount}/${endpoints.length}`);
  console.log(`❌ Failed: ${failCount}/${endpoints.length}`);
  
  if (successCount === endpoints.length) {
    console.log('\n🎉 ALL ENDPOINTS WORKING! Frontend errors should be resolved.');
  } else {
    console.log('\n⏳ Some endpoints still missing - deployment may still be in progress.');
  }
}

runTests().catch(console.error);