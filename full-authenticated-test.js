/**
 * Full Authenticated API Testing
 * Tests all endpoints with authentication
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'test@test.com',
  password: 'TestPassword123!'
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let authToken = null;
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  categories: {}
};

async function testEndpoint(name, method, path, data = null, requiresAuth = false) {
  testResults.total++;
  
  try {
    const config = {
      method,
      url: `${BACKEND_URL}${path}`,
      headers: {},
      validateStatus: () => true
    };

    if (requiresAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    const passed = response.status < 500;
    
    if (passed) {
      testResults.passed++;
      log(`  ✓ ${name} - Status: ${response.status}`, 'green');
      return { success: true, status: response.status, data: response.data };
    } else {
      testResults.failed++;
      log(`  ✗ ${name} - Status: ${response.status}`, 'red');
      return { success: false, status: response.status, error: response.data };
    }
  } catch (error) {
    testResults.failed++;
    log(`  ✗ ${name} - Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function login() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                  Authenticating                         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_USER);
    
    if (response.data.token) {
      authToken = response.data.token;
      log(`✓ Login successful`, 'green');
      log(`  User: ${response.data.user.name} (${response.data.user.email})`, 'cyan');
      return true;
    }
  } catch (error) {
    log(`✗ Login failed: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

async function testCategory(name, tests) {
  log(`\n╔════════════════════════════════════════════════════════╗`, 'cyan');
  log(`║  ${name.padEnd(54)}║`, 'cyan');
  log(`╚════════════════════════════════════════════════════════╝`, 'cyan');
  
  testResults.categories[name] = { passed: 0, failed: 0 };
  const startTotal = testResults.total;
  const startPassed = testResults.passed;
  
  for (const test of tests) {
    await testEndpoint(test.name, test.method, test.path, test.data, test.auth);
  }
  
  testResults.categories[name].passed = testResults.passed - startPassed;
  testResults.categories[name].failed = (testResults.total - startTotal) - testResults.categories[name].passed;
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║      Full Authenticated API Testing Suite              ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  
  // Login first
  const loggedIn = await login();
  
  if (!loggedIn) {
    log('\n✗ Cannot proceed without authentication', 'red');
    return;
  }
  
  // Test all categories
  await testCategory('Public Endpoints', [
    { name: 'GET /api/status', method: 'GET', path: '/api/status', auth: false },
    { name: 'GET /api/announcements', method: 'GET', path: '/api/announcements', auth: false }
  ]);
  
  await testCategory('Dashboard', [
    { name: 'GET /api/dashboard/stats', method: 'GET', path: '/api/dashboard/stats', auth: true },
    { name: 'GET /api/dashboard/recent-activity', method: 'GET', path: '/api/dashboard/recent-activity', auth: true }
  ]);
  
  await testCategory('Profile', [
    { name: 'GET /api/auth/me', method: 'GET', path: '/api/auth/me', auth: true }
  ]);
  
  await testCategory('Clients', [
    { name: 'GET /api/clients', method: 'GET', path: '/api/clients', auth: true },
    { name: 'POST /api/clients (no data)', method: 'POST', path: '/api/clients', data: {}, auth: true }
  ]);
  
  await testCategory('Projects', [
    { name: 'GET /api/projects', method: 'GET', path: '/api/projects', auth: true },
    { name: 'POST /api/projects (no data)', method: 'POST', path: '/api/projects', data: {}, auth: true }
  ]);
  
  await testCategory('Tasks', [
    { name: 'GET /api/tasks', method: 'GET', path: '/api/tasks', auth: true },
    { name: 'POST /api/tasks (no data)', method: 'POST', path: '/api/tasks', data: {}, auth: true }
  ]);
  
  await testCategory('Invoices', [
    { name: 'GET /api/invoices', method: 'GET', path: '/api/invoices', auth: true },
    { name: 'POST /api/invoices (no data)', method: 'POST', path: '/api/invoices', data: {}, auth: true }
  ]);
  
  await testCategory('Time Tracking', [
    { name: 'GET /api/time-tracking', method: 'GET', path: '/api/time-tracking', auth: true },
    { name: 'POST /api/time-tracking (no data)', method: 'POST', path: '/api/time-tracking', data: {}, auth: true }
  ]);
  
  await testCategory('Reports', [
    { name: 'GET /api/reports', method: 'GET', path: '/api/reports', auth: true }
  ]);
  
  await testCategory('Notifications', [
    { name: 'GET /api/notifications', method: 'GET', path: '/api/notifications', auth: true },
    { name: 'GET /api/notifications/unread-count', method: 'GET', path: '/api/notifications/unread-count', auth: true }
  ]);
  
  // Print summary
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                   Test Summary                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\nTotal Tests: ${testResults.total}`, 'cyan');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`\nPass Rate: ${passRate}%`, passRate > 80 ? 'green' : passRate > 50 ? 'yellow' : 'red');
  
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║              Results by Category                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  for (const [category, results] of Object.entries(testResults.categories)) {
    const total = results.passed + results.failed;
    const rate = total > 0 ? ((results.passed / total) * 100).toFixed(0) : 0;
    const status = results.failed === 0 ? '✓' : '✗';
    log(`  ${status} ${category}: ${results.passed}/${total} (${rate}%)`, results.failed === 0 ? 'green' : 'yellow');
  }
  
  log('\n╔════════════════════════════════════════════════════════╗', 'magenta');
  log('║              Manual Testing Needed                      ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'magenta');
  
  log('\nThe following require manual testing in the browser:', 'yellow');
  log('  1. UI interactions (buttons, forms, modals)', 'yellow');
  log('  2. Page navigation and routing', 'yellow');
  log('  3. Form validation and error messages', 'yellow');
  log('  4. Data display and formatting', 'yellow');
  log('  5. Responsive design on different screen sizes', 'yellow');
  log('  6. Create/Edit/Delete operations with real data', 'yellow');
  log('\nOpen http://localhost:3001 in your browser to test these.', 'cyan');
}

main().catch(console.error);
