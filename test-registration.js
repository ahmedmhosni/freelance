const https = require('https');

console.log('🔍 Testing Registration Endpoint');
console.log('===============================');

async function testRegistration(userData) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(userData);
    
    const options = {
      hostname: 'api.roastify.online',
      port: 443,
      path: '/api/auth/register',
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

async function runTests() {
  console.log('🌐 Testing: https://api.roastify.online/api/auth/register\n');
  
  // Test 1: Valid registration data
  console.log('📋 Test 1: Valid registration');
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  };
  
  const test1 = await testRegistration(testUser);
  console.log(`   Status: ${test1.status}`);
  console.log(`   Response: ${test1.body || test1.error}\n`);
  
  // Test 2: Check if user was created by testing login
  if (test1.status === 200 || test1.status === 201) {
    console.log('📋 Test 2: Login with created user');
    
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };
    
    const loginTest = await testLogin(loginData);
    console.log(`   Login Status: ${loginTest.status}`);
    console.log(`   Login Response: ${loginTest.body || loginTest.error}\n`);
  }
  
  console.log('📊 Analysis:');
  console.log('   201 = User created successfully');
  console.log('   400 = Validation error');
  console.log('   409 = User already exists');
  console.log('   500 = Server error');
}

async function testLogin(loginData) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(loginData);
    
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

runTests().catch(console.error);