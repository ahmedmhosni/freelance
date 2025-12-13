const https = require('https');

console.log('🔍 Testing Environment Variables Endpoint');
console.log('=========================================');

async function testEnvVars() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.roastify.online',
      port: 443,
      path: '/api/debug/env',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTest() {
  console.log('🌐 Testing: https://api.roastify.online/api/debug/env\n');
  
  const result = await testEnvVars();
  console.log(`📊 Status: ${result.status}`);
  
  if (result.body) {
    console.log(`📄 Response: ${result.body}`);
  } else if (result.error) {
    console.log(`❌ Error: ${result.error}`);
  }
  
  console.log('\n💡 If this returns 404, we need to add a debug endpoint');
  console.log('   If this returns environment info, we can see what\'s missing');
}

runTest().catch(console.error);