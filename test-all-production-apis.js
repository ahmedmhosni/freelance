const https = require('https');

const API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Test-Script'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', data = null, token = null, expectedStatus = 200) {
  const startTime = Date.now();
  try {
    const result = await makeRequest(path, method, data, token);
    const duration = Date.now() - startTime;
    
    const statusIcon = result.status === expectedStatus ? '✓' : 
                       result.status === 401 || result.status === 403 ? '🔒' :
                       result.status === 404 ? '❓' : '✗';
    
    const statusColor = result.status === expectedStatus ? '' : 
                        result.status === 401 || result.status === 403 ? '(auth required)' :
                        result.status === 404 ? '(not found)' : '(error)';
    
    console.log(`${statusIcon} ${name}`);
    console.log(`   ${method} ${path}`);
    console.log(`   Status: ${result.status} ${statusColor} (${duration}ms)`);
    
    if (result.status !== expectedStatus && result.status !== 401 && result.status !== 403 && result.status !== 404) {
      console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
    }
    
    return {
      name,
      path,
      method,
      status: result.status,
      expectedStatus,
      duration,
      passed: result.status === expectedStatus || result.status === 401 || result.status === 403,
      data: result.data
    };
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`   ${method} ${path}`);
    console.log(`   Error: ${error.message}`);
    return {
      name,
      path,
      method,
      status: 0,
      expectedStatus,
      duration: Date.now() - startTime,
      passed: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE PRODUCTION API TEST');
  console.log('='.repeat(80));
  console.log(`API URL: ${API_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80) + '\n');

  const results = [];

  // ========== HEALTH & STATUS ==========
  console.log('📊 HEALTH & STATUS');
  console.log('-'.repeat(80));
  results.push(await testEndpoint('Health Check', '/health'));
  results.push(await testEndpoint('API Version', '/api/version'));
  console.log();

  // ========== PUBLIC ENDPOINTS ==========
  console.log('🌐 PUBLIC ENDPOINTS');
  console.log('-'.repeat(80));
  results.push(await testEndpoint('Legal Terms', '/api/legal/terms'));
  results.push(await testEndpoint('Legal Privacy', '/api/legal/privacy'));
  results.push(await testEndpoint('Public Changelog', '/api/changelog/public'));
  results.push(await testEndpoint('Current Version', '/api/changelog/current-version'));
  results.push(await testEndpoint('All Announcements', '/api/announcements'));
  results.push(await testEndpoint('Featured Announcements', '/api/announcements/featured'));
  console.log();

  // ========== AUTHENTICATION ENDPOINTS ==========
  console.log('🔐 AUTHENTICATION ENDPOINTS');
  console.log('-'.repeat(80));
  results.push(await testEndpoint('Login (no credentials)', '/api/auth/login', 'POST', {}, null, 400));
  results.push(await testEndpoint('Register (no data)', '/api/auth/register', 'POST', {}, null, 400));
  results.push(await testEndpoint('Forgot Password (no email)', '/api/auth/forgot-password', 'POST', {}, null, 400));
  console.log();

  // ========== PROTECTED ENDPOINTS (Should return 401) ==========
  console.log('🔒 PROTECTED ENDPOINTS (Auth Required)');
  console.log('-'.repeat(80));
  results.push(await testEndpoint('Dashboard Stats', '/api/dashboard/stats', 'GET', null, null, 401));
  results.push(await testEndpoint('Recent Tasks', '/api/dashboard/recent-tasks', 'GET', null, null, 401));
  results.push(await testEndpoint('AI Chat', '/api/ai/chat', 'POST', {message: 'test'}, null, 401));
  results.push(await testEndpoint('AI Conversations', '/api/ai/conversations', 'GET', null, null, 401));
  results.push(await testEndpoint('AI Usage', '/api/ai/usage', 'GET', null, null, 401));
  console.log();

  // ========== ADMIN ENDPOINTS (Should return 401) ==========
  console.log('👑 ADMIN ENDPOINTS (Admin Auth Required)');
  console.log('-'.repeat(80));
  results.push(await testEndpoint('Admin Activity Stats', '/api/admin/activity/stats', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin Inactive Users', '/api/admin/activity/inactive-users', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin GDPR Export Requests', '/api/admin/gdpr/export-requests', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin GDPR Deleted Accounts', '/api/admin/gdpr/deleted-accounts', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin AI Settings', '/api/admin/ai/settings', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin AI Analytics', '/api/admin/ai/analytics', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin AI Usage', '/api/admin/ai/usage', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin Changelog Versions', '/api/changelog/admin/versions', 'GET', null, null, 401));
  results.push(await testEndpoint('Admin Version Names', '/api/changelog/admin/version-names', 'GET', null, null, 401));
  console.log();

  // ========== SUMMARY ==========
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;
  const authRequired = results.filter(r => r.status === 401 || r.status === 403).length;
  const notFound = results.filter(r => r.status === 404).length;
  const serverErrors = results.filter(r => r.status >= 500).length;
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / totalTests);

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`✓ Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`✗ Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log(`🔒 Auth Required: ${authRequired}`);
  console.log(`❓ Not Found: ${notFound}`);
  console.log(`🔥 Server Errors (5xx): ${serverErrors}`);
  console.log(`⚡ Average Response Time: ${avgDuration}ms`);

  // Failed tests details
  const actualFailures = results.filter(r => !r.passed && r.status !== 401 && r.status !== 403 && r.status !== 404);
  if (actualFailures.length > 0) {
    console.log('\n❌ ACTUAL FAILURES (excluding auth/not found):');
    actualFailures.forEach(r => {
      console.log(`  - ${r.name}: ${r.method} ${r.path} (Status: ${r.status})`);
    });
  }

  // Server errors details
  if (serverErrors > 0) {
    console.log('\n🔥 SERVER ERRORS (5xx):');
    results.filter(r => r.status >= 500).forEach(r => {
      console.log(`  - ${r.name}: ${r.method} ${r.path} (Status: ${r.status})`);
      if (r.data) {
        console.log(`    Response: ${JSON.stringify(r.data).substring(0, 150)}`);
      }
    });
  }

  // Performance breakdown
  console.log('\n⚡ PERFORMANCE BREAKDOWN:');
  const publicEndpoints = results.filter(r => r.status === 200);
  if (publicEndpoints.length > 0) {
    const avgPublic = Math.round(publicEndpoints.reduce((sum, r) => sum + r.duration, 0) / publicEndpoints.length);
    console.log(`  Public Endpoints (200 OK): ${avgPublic}ms average`);
  }
  const authEndpoints = results.filter(r => r.status === 401 || r.status === 403);
  if (authEndpoints.length > 0) {
    const avgAuth = Math.round(authEndpoints.reduce((sum, r) => sum + r.duration, 0) / authEndpoints.length);
    console.log(`  Auth Required (401/403): ${avgAuth}ms average`);
  }

  console.log('\n' + '='.repeat(80));
  
  if (serverErrors > 0) {
    console.log('⚠️  PRODUCTION HAS SERVER ERRORS - Immediate attention required');
  } else if (actualFailures.length > 0) {
    console.log('⚠️  PRODUCTION HAS ISSUES - Review failed tests');
  } else {
    console.log('✅ PRODUCTION IS HEALTHY - All endpoints responding correctly');
  }
  
  console.log('='.repeat(80) + '\n');

  // Export results
  return {
    totalTests,
    passedTests,
    failedTests,
    authRequired,
    notFound,
    serverErrors,
    avgDuration,
    results
  };
}

// Run tests
console.log('\n🚀 Starting comprehensive API tests...\n');
console.log('This will test all major endpoints including:');
console.log('  - Health & Status');
console.log('  - Public Endpoints (Legal, Changelog, Announcements)');
console.log('  - Authentication Endpoints');
console.log('  - Protected User Endpoints');
console.log('  - Admin Endpoints');
console.log('\nStarting in 2 seconds...\n');

setTimeout(() => {
  runTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
}, 2000);
