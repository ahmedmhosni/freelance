const https = require('https');

console.log('🔍 Testing All API Endpoints');
console.log('============================');

const baseUrl = 'https://api.roastify.online';
const endpoints = [
  '/',
  '/api/health',
  '/api/auth/test',
  '/api/profile',
  '/api/dashboard',
  '/api/quotes/daily',
  '/api/maintenance/status',
  '/api/ai/status',
  '/api/preferences',
  '/api/feedback',
  '/api/announcements/featured',
  '/api/changelog/current-version',
  '/api/gdpr/status',
  '/status'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = baseUrl + endpoint;
    const req = https.get(url, (res) => {
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
    
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({
        endpoint,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

async function testAllEndpoints() {
  console.log(`🌐 Base URL: ${baseUrl}\n`);
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${endpoint.padEnd(25)} | ${result.status} | ${result.error}`);
    } else if (result.status === 200) {
      console.log(`✅ ${endpoint.padEnd(25)} | ${result.status} | ${result.body.replace(/\n/g, ' ')}`);
    } else if (result.status === 404) {
      console.log(`⚠️  ${endpoint.padEnd(25)} | ${result.status} | Not Found`);
    } else {
      console.log(`🔶 ${endpoint.padEnd(25)} | ${result.status} | ${result.body.substring(0, 50)}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('✅ = Working (200 OK)');
  console.log('⚠️ = Not Found (404) - Expected for some endpoints');
  console.log('❌ = Error or Timeout');
  console.log('🔶 = Other status codes');
}

testAllEndpoints().catch(console.error);