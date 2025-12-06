/**
 * Comprehensive API Testing Script
 * Tests all backend endpoints systematically
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  needsManualTest: []
};

let authToken = null;

async function testEndpoint(name, method, path, data = null, requiresAuth = false, expectedStatus = null) {
  testResults.total++;
  
  try {
    const config = {
      method,
      url: `${BACKEND_URL}${path}`,
      headers: {},
      validateStatus: () => true // Accept any status
    };

    if (requiresAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    // Determine if test passed
    let passed = false;
    if (expectedStatus) {
      passed = response.status === expectedStatus;
    } else {
      // If no expected status, consider < 500 as success (endpoint exists)
      passed = response.status < 500;
    }
    
    if (passed) {
      testResults.passed++;
      log(`  ✓ ${name} - Status: ${response.status}`, 'green');
      return { success: true, status: response.status, data: response.data };
    } else {
      testResults.failed++;
      log(`  ✗ ${name} - Status: ${response.status} (Expected: ${expectedStatus || '< 500'})`, 'red');
      return { success: false, status: response.status, error: response.data };
    }
  } catch (error) {
    testResults.failed++;
    log(`  ✗ ${name} - Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testPublicEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║              Testing Public Endpoints                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  await testEndpoint('GET /api/status', 'GET', '/api/status', null, false, 200);
  await testEndpoint('GET /api/announcements', 'GET', '/api/announcements', null, false, 200);
  await testEndpoint('GET /api/changelog', 'GET', '/api/changelog', null, false);
}

async function testAuthEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║            Testing Authentication Endpoints             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  // Test login endpoint exists (will fail without credentials, but that's ok)
  await testEndpoint('POST /api/auth/login (no creds)', 'POST', '/api/auth/login', {}, false, 400);
  
  // Test register endpoint exists
  await testEndpoint('POST /api/auth/register (no data)', 'POST', '/api/auth/register', {}, false, 400);
  
  // Test forgot password endpoint
  await testEndpoint('POST /api/auth/forgot-password (no email)', 'POST', '/api/auth/forgot-password', {}, false, 400);
  
  log('\n  ℹ Note: Authentication endpoints exist but require valid credentials', 'cyan');
  testResults.needsManualTest.push('Login with valid credentials');
  testResults.needsManualTest.push('Register new user');
  testResults.needsManualTest.push('Password reset flow');
}

async function testClientEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║              Testing Client Endpoints                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  const result = await testEndpoint('GET /api/clients', 'GET', '/api/clients', null, true, 200);
  
  if (result.success && result.data && result.data.length > 0) {
    const clientId = result.data[0].id;
    await testEndpoint(`GET /api/clients/${clientId}`, 'GET', `/api/clients/${clientId}`, null, true, 200);
  }
  
  await testEndpoint('POST /api/clients (no data)', 'POST', '/api/clients', {}, true);
}

async function testProjectEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║             Testing Project Endpoints                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  const result = await testEndpoint('GET /api/projects', 'GET', '/api/projects', null, true, 200);
  
  if (result.success && result.data && result.data.length > 0) {
    const projectId = result.data[0].id;
    await testEndpoint(`GET /api/projects/${projectId}`, 'GET', `/api/projects/${projectId}`, null, true, 200);
  }
}

async function testTaskEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║              Testing Task Endpoints                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  await testEndpoint('GET /api/tasks', 'GET', '/api/tasks', null, true, 200);
}

async function testInvoiceEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║             Testing Invoice Endpoints                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  await testEndpoint('GET /api/invoices', 'GET', '/api/invoices', null, true, 200);
}

async function testTimeTrackingEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║          Testing Time Tracking Endpoints                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  await testEndpoint('GET /api/time-tracking', 'GET', '/api/time-tracking', null, true, 200);
}

async function testReportEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║             Testing Report Endpoints                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  await testEndpoint('GET /api/reports', 'GET', '/api/reports', null, true);
}

async function testNotificationEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║          Testing Notification Endpoints                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  await testEndpoint('GET /api/notifications', 'GET', '/api/notifications', null, true, 200);
}

async function testDashboardEndpoints() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║           Testing Dashboard Endpoints                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (!authToken) {
    log('  ⚠ Skipping - requires authentication', 'yellow');
    testResults.skipped += 5;
    return;
  }
  
  await testEndpoint('GET /api/dashboard/stats', 'GET', '/api/dashboard/stats', null, true);
  await testEndpoint('GET /api/dashboard/recent-activity', 'GET', '/api/dashboard/recent-activity', null, true);
}

async function printSummary() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                   Test Summary                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\nTotal Tests: ${testResults.total}`, 'cyan');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`Skipped: ${testResults.skipped}`, 'yellow');
  
  const passRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  log(`\nPass Rate: ${passRate}%`, passRate > 80 ? 'green' : passRate > 50 ? 'yellow' : 'red');
  
  if (testResults.needsManualTest.length > 0) {
    log('\n╔════════════════════════════════════════════════════════╗', 'magenta');
    log('║            Manual Testing Required                      ║', 'magenta');
    log('╚════════════════════════════════════════════════════════╝', 'magenta');
    
    testResults.needsManualTest.forEach((item, index) => {
      log(`  ${index + 1}. ${item}`, 'yellow');
    });
  }
  
  if (testResults.skipped > 0) {
    log('\n  ℹ Note: Some tests were skipped due to missing authentication', 'cyan');
    log('  To test authenticated endpoints, you need to:', 'cyan');
    log('    1. Login to the application', 'cyan');
    log('    2. Provide valid test credentials', 'cyan');
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║        Comprehensive API Testing Suite                 ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  
  log(`\nBackend URL: ${BACKEND_URL}`, 'cyan');
  log(`Starting tests...\n`, 'cyan');
  
  try {
    // Test public endpoints first
    await testPublicEndpoints();
    await testAuthEndpoints();
    
    // Test authenticated endpoints (will skip if no auth)
    await testClientEndpoints();
    await testProjectEndpoints();
    await testTaskEndpoints();
    await testInvoiceEndpoints();
    await testTimeTrackingEndpoints();
    await testReportEndpoints();
    await testNotificationEndpoints();
    await testDashboardEndpoints();
    
    // Print summary
    await printSummary();
    
  } catch (error) {
    log(`\n✗ Test suite failed with error: ${error.message}`, 'red');
    console.error(error);
  }
}

main().catch(console.error);
