const https = require('https');

console.log('🔍 Testing Login with Verified User');
console.log('==================================');

async function testLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'api.roastify.online',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
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

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('🌐 Testing: https://api.roastify.online/api/auth/login');
  console.log('👤 User: test@roastify.online (verified)');
  console.log('🔑 Password: TestPassword123!\n');
  
  const result = await testLogin('test@roastify.online', 'TestPassword123!');
  
  console.log(`📊 Status: ${result.status}`);
  
  if (result.status === 200) {
    console.log('🎉 LOGIN SUCCESSFUL!');
    const response = JSON.parse(result.body);
    console.log(`✅ Token received: ${response.token ? 'YES' : 'NO'}`);
    console.log(`✅ User data: ${response.user ? JSON.stringify(response.user, null, 2) : 'NO'}`);
  } else if (result.status === 401) {
    console.log('❌ LOGIN FAILED: Invalid credentials');
    console.log(`📄 Response: ${result.body}`);
  } else if (result.status === 403) {
    console.log('⚠️ LOGIN BLOCKED: Email not verified');
    console.log(`📄 Response: ${result.body}`);
  } else if (result.status === 500) {
    console.log('🚨 SERVER ERROR: Internal server error');
    console.log(`📄 Response: ${result.body}`);
  } else {
    console.log(`🔶 UNEXPECTED STATUS: ${result.status}`);
    console.log(`📄 Response: ${result.body || result.error}`);
  }
}

runTest().catch(console.error);