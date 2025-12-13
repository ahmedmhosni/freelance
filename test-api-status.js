const https = require('https');

console.log('🔍 Testing API Status');
console.log('====================');

const urls = [
  'https://api.roastify.online/',
  'https://api.roastify.online/api/health',
  'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/',
  'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/health'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 200) // First 200 chars
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

async function testAllUrls() {
  for (const url of urls) {
    console.log(`\n🔗 Testing: ${url}`);
    const result = await testUrl(url);
    
    if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${result.status}: ${result.error}`);
    } else {
      console.log(`📊 Status: ${result.status}`);
      if (result.body) {
        console.log(`📄 Response: ${result.body}`);
      }
    }
  }
}

testAllUrls().catch(console.error);