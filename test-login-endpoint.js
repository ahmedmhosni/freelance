const https = require('https');

console.log('🔍 Testing Login Endpoint');
console.log('========================');

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
          headers: res.headers,
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

async function runTests() {
  console.log('🌐 Testing: https://api.roastify.online/api/auth/login\n');
  
  // Test 1: Empty body
  console.log('📋 Test 1: Empty body');
  const test1 = await testLogin('', '');
  console.log(`   Status: ${test1.status}`);
  console.log(`   Response: ${test1.body || test1.error}\n`);
  
  // Test 2: Invalid credentials
  console.log('📋 Test 2: Invalid credentials');
  const test2 = await testLogin('test@example.com', 'wrongpassword');
  console.log(`   Status: ${test2.status}`);
  console.log(`   Response: ${test2.body || test2.error}\n`);
  
  // Test 3: Valid format but non-existent user
  console.log('📋 Test 3: Valid format, non-existent user');
  const test3 = await testLogin('nonexistent@example.com', 'password123');
  console.log(`   Status: ${test3.status}`);
  console.log(`   Response: ${test3.body || test3.error}\n`);
  
  console.log('📊 Analysis:');
  console.log('   400 = Bad Request (validation error)');
  console.log('   401 = Unauthorized (wrong credentials)');
  console.log('   404 = User not found');
  console.log('   500 = Internal Server Error (database/code issue)');
}

runTests().catch(console.error);