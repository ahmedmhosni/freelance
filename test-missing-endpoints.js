const https = require('https');

console.log('🔍 Testing Missing API Endpoints');
console.log('===============================');

const endpoints = [
  '/api/time-tracking/running',
  '/api/tasks',
  '/api/notifications', 
  '/api/projects',
  '/api/clients',
  '/api/invoices',
  '/api/time-tracking'
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
          body: data.substring(0, 100) // First 100 chars
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
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    if (result.status === 200) {
      console.log(`✅ ${endpoint.padEnd(30)} | 200 OK | ${result.body}`);
    } else if (result.status === 404) {
      console.log(`❌ ${endpoint.padEnd(30)} | 404 Not Found`);
    } else {
      console.log(`🔶 ${endpoint.padEnd(30)} | ${result.status} | ${result.error || result.body}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('✅ = Working (200 OK) - Frontend errors should be resolved');
  console.log('❌ = Still missing (404) - Need more time for deployment');
  console.log('🔶 = Other status');
}

runTests().catch(console.error);