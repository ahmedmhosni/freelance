// Comprehensive Production API and Database Test
const axios = require('axios');

const API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

// Test credentials (you'll need to update these)
const TEST_USER = {
  email: 'admin@roastify.com',
  password: 'Admin@123456'
};

let authToken = null;

async function testEndpoint(method, endpoint, description, data = null, requiresAuth = false) {
  console.log(`\n${description}`);
  console.log(`${method} ${endpoint}`);
  
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      timeout: 15000,
      validateStatus: () => true,
      headers: {}
    };

    if (requiresAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    const statusIcon = response.status < 300 ? '✓' : response.status < 500 ? '⚠' : '✗';
    console.log(`${statusIcon} Status: ${response.status} (${duration}ms)`);
    
    if (response.data) {
      const preview = JSON.stringify(response.data).substring(0, 150);
      console.log(`  Response: ${preview}${preview.length >= 150 ? '...' : ''}`);
    }
    
    return { 
      success: response.status < 400, 
      status: response.status, 
      duration,
      data: response.data 
    };
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('PRODUCTION API & DATABASE COMPREHENSIVE TEST');
  console.log('='.repeat(70));
  console.log(`API URL: ${API_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // 1. HEALTH CHECK
  console.log('\n📊 SECTION 1: HEALTH & STATUS');
  console.log('-'.repeat(70));
  
  let test = await testEndpoint('GET', '/health', '1.1 Health Check');
  results.tests.push({ name: 'Health Check', ...test });
  results.total++;
  if (test.success) results.passed++; else results.failed++;

  test = await testEndpoint('GET', '/api/version', '1.2 API Version');
  results.tests.push({ name: 'API Version', ...test });
  results.total++;
  if (test.success) results.passed++; else results.failed++;

  // 2. AUTHENTICATION
  console.log('\n🔐 SECTION 2: AUTHENTICATION');
  console.log('-'.repeat(70));
  
  test = await testEndpoint('POST', '/api/auth/login', '2.1 Login', TEST_USER);
  results.tests.push({ name: 'Login', ...test });
  results.total++;
  if (test.success) {
    results.passed++;
    if (test.data && test.data.token) {
      authToken = test.data.token;
      console.log(`  ✓ Auth token obtained`);
    }
  } else {
    results.failed++;
  }

  test = await testEndpoint('GET', '/api/auth/check', '2.2 Auth Check', null, true);
  results.tests.push({ name: 'Auth Check', ...test });
  results.total++;
  if (test.success) results.passed++; else results.failed++;

  // 3. PUBLIC ENDPOINTS
  console.log('\n🌐 SECTION 3: PUBLIC ENDPOINTS');
  console.log('-'.repeat(70));
  
  test = await testEndpoint('GET', '/api/legal/terms', '3.1 Legal Terms');
  results.tests.push({ name: 'Legal Terms', ...test });
  results.total++;
  if (test.success) results.passed++; else results.failed++;

  test = await testEndpoint('GET', '/api/legal/privacy', '3.2 Legal Privacy');
  results.tests.push({ name: 'Legal Privacy', ...test });
  results.total++;
  if (test.success) results.passed++; else results.failed++;

  test = await testEndpoint('GET', '/api/changelog/public', '3.3 Public Changelog');
  results.tests.push({ name: 'Public Changelog', ...test });
  results.total++;
  if (test.success) results.passed++; else results.failed++;

  // 4. AUTHENTICATED ENDPOINTS (if we have token)
  if (authToken) {
    console.log('\n🔒 SECTION 4: AUTHENTICATED ENDPOINTS');
    console.log('-'.repeat(70));
    
    test = await testEndpoint('GET', '/api/clients', '4.1 Get Clients', null, true);
    results.tests.push({ name: 'Get Clients', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/projects', '4.2 Get Projects', null, true);
    results.tests.push({ name: 'Get Projects', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/invoices', '4.3 Get Invoices', null, true);
    results.tests.push({ name: 'Get Invoices', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/tasks', '4.4 Get Tasks', null, true);
    results.tests.push({ name: 'Get Tasks', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/time-tracking', '4.5 Get Time Entries', null, true);
    results.tests.push({ name: 'Get Time Entries', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    // 5. ADMIN ENDPOINTS
    console.log('\n👑 SECTION 5: ADMIN ENDPOINTS');
    console.log('-'.repeat(70));
    
    test = await testEndpoint('GET', '/api/admin/activity/stats', '5.1 Activity Stats', null, true);
    results.tests.push({ name: 'Activity Stats', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/admin/gdpr/export-requests', '5.2 GDPR Requests', null, true);
    results.tests.push({ name: 'GDPR Requests', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/admin/ai/settings', '5.3 AI Settings', null, true);
    results.tests.push({ name: 'AI Settings', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    // 6. AI ENDPOINTS
    console.log('\n🤖 SECTION 6: AI ASSISTANT');
    console.log('-'.repeat(70));
    
    test = await testEndpoint('GET', '/api/ai/usage', '6.1 AI Usage', null, true);
    results.tests.push({ name: 'AI Usage', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/ai/conversations', '6.2 AI Conversations', null, true);
    results.tests.push({ name: 'AI Conversations', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    // 7. USER PREFERENCES & GDPR
    console.log('\n⚙️  SECTION 7: USER PREFERENCES & GDPR');
    console.log('-'.repeat(70));
    
    test = await testEndpoint('GET', '/api/preferences', '7.1 Get Preferences', null, true);
    results.tests.push({ name: 'Get Preferences', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;

    test = await testEndpoint('GET', '/api/gdpr/data', '7.2 GDPR Data', null, true);
    results.tests.push({ name: 'GDPR Data', ...test });
    results.total++;
    if (test.success) results.passed++; else results.failed++;
  } else {
    console.log('\n⚠️  Skipping authenticated tests - no auth token');
  }

  // SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✓ Passed: ${results.passed} (${Math.round(results.passed/results.total*100)}%)`);
  console.log(`✗ Failed: ${results.failed} (${Math.round(results.failed/results.total*100)}%)`);

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests.filter(t => !t.success).forEach(t => {
      console.log(`  - ${t.name}: ${t.error || `Status ${t.status}`}`);
    });
  }

  // Performance Analysis
  const successfulTests = results.tests.filter(t => t.success && t.duration);
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, t) => sum + t.duration, 0) / successfulTests.length;
    const slowTests = successfulTests.filter(t => t.duration > 3000);
    
    console.log('\n⚡ PERFORMANCE:');
    console.log(`  Average Response Time: ${Math.round(avgDuration)}ms`);
    if (slowTests.length > 0) {
      console.log(`  ⚠️  Slow Responses (>3s): ${slowTests.length}`);
      slowTests.forEach(t => {
        console.log(`    - ${t.name}: ${t.duration}ms`);
      });
    }
  }

  // Database Connection Status
  console.log('\n💾 DATABASE STATUS:');
  const dbTests = results.tests.filter(t => 
    t.name.includes('Clients') || 
    t.name.includes('Projects') || 
    t.name.includes('Activity Stats')
  );
  const dbWorking = dbTests.filter(t => t.success).length;
  if (dbWorking > 0) {
    console.log(`  ✓ Database connection working (${dbWorking}/${dbTests.length} tests passed)`);
  } else {
    console.log(`  ✗ Database connection issues detected`);
  }

  console.log('\n' + '='.repeat(70));
  
  if (results.passed === results.total) {
    console.log('🎉 ALL TESTS PASSED - PRODUCTION IS HEALTHY!');
  } else if (results.passed / results.total > 0.8) {
    console.log('✅ PRODUCTION IS MOSTLY HEALTHY - Minor issues detected');
  } else {
    console.log('⚠️  PRODUCTION HAS ISSUES - Immediate attention required');
  }
  
  console.log('='.repeat(70));
}

// Run tests
console.log('\nStarting production tests in 2 seconds...\n');
setTimeout(() => {
  runTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
}, 2000);
