/**
 * Frontend Page Testing Script
 * Tests all pages and buttons to ensure they work properly
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:5000';

// Test credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123'
};

let authToken = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Test API endpoints
async function testEndpoint(method, path, data = null, requiresAuth = false) {
  try {
    const config = {
      method,
      url: `${BACKEND_URL}${path}`,
      headers: {}
    };

    if (requiresAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data?.message || error.message
    };
  }
}

// Test authentication
async function testAuthentication() {
  log('\n=== Testing Authentication ===', 'blue');
  
  // Test login
  logInfo('Testing login...');
  const loginResult = await testEndpoint('POST', '/api/auth/login', TEST_USER);
  
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    logSuccess(`Login successful - Token received`);
    return true;
  } else {
    logError(`Login failed: ${loginResult.error}`);
    logWarning('Some tests will be skipped due to authentication failure');
    return false;
  }
}

// Test public pages
async function testPublicPages() {
  log('\n=== Testing Public Pages ===', 'blue');
  
  const publicEndpoints = [
    { path: '/api/changelog', name: 'Changelog' },
    { path: '/api/status', name: 'Public Status' },
    { path: '/api/announcements', name: 'Announcements' }
  ];

  for (const endpoint of publicEndpoints) {
    logInfo(`Testing ${endpoint.name}...`);
    const result = await testEndpoint('GET', endpoint.path);
    
    if (result.success) {
      logSuccess(`${endpoint.name} - Status: ${result.status}`);
    } else {
      logError(`${endpoint.name} - Failed: ${result.error}`);
    }
  }
}

// Test dashboard and main features
async function testDashboardFeatures() {
  if (!authToken) {
    logWarning('Skipping dashboard tests - not authenticated');
    return;
  }

  log('\n=== Testing Dashboard Features ===', 'blue');
  
  const dashboardEndpoints = [
    { path: '/api/dashboard/stats', name: 'Dashboard Stats' },
    { path: '/api/dashboard/recent-activity', name: 'Recent Activity' }
  ];

  for (const endpoint of dashboardEndpoints) {
    logInfo(`Testing ${endpoint.name}...`);
    const result = await testEndpoint('GET', endpoint.path, null, true);
    
    if (result.success) {
      logSuccess(`${endpoint.name} - Status: ${result.status}`);
    } else {
      logError(`${endpoint.name} - Failed: ${result.error}`);
    }
  }
}

// Test clients module
async function testClientsModule() {
  if (!authToken) {
    logWarning('Skipping clients tests - not authenticated');
    return;
  }

  log('\n=== Testing Clients Module ===', 'blue');
  
  // Get clients list
  logInfo('Testing get clients list...');
  const clientsResult = await testEndpoint('GET', '/api/clients', null, true);
  
  if (clientsResult.success) {
    logSuccess(`Get clients - Status: ${clientsResult.status}, Count: ${clientsResult.data?.length || 0}`);
    
    // If we have clients, test getting a single client
    if (clientsResult.data && clientsResult.data.length > 0) {
      const clientId = clientsResult.data[0].id;
      logInfo(`Testing get single client (ID: ${clientId})...`);
      const singleClientResult = await testEndpoint('GET', `/api/clients/${clientId}`, null, true);
      
      if (singleClientResult.success) {
        logSuccess(`Get single client - Status: ${singleClientResult.status}`);
      } else {
        logError(`Get single client - Failed: ${singleClientResult.error}`);
      }
    }
  } else {
    logError(`Get clients - Failed: ${clientsResult.error}`);
  }
}

// Test projects module
async function testProjectsModule() {
  if (!authToken) {
    logWarning('Skipping projects tests - not authenticated');
    return;
  }

  log('\n=== Testing Projects Module ===', 'blue');
  
  // Get projects list
  logInfo('Testing get projects list...');
  const projectsResult = await testEndpoint('GET', '/api/projects', null, true);
  
  if (projectsResult.success) {
    logSuccess(`Get projects - Status: ${projectsResult.status}, Count: ${projectsResult.data?.length || 0}`);
    
    // If we have projects, test getting a single project
    if (projectsResult.data && projectsResult.data.length > 0) {
      const projectId = projectsResult.data[0].id;
      logInfo(`Testing get single project (ID: ${projectId})...`);
      const singleProjectResult = await testEndpoint('GET', `/api/projects/${projectId}`, null, true);
      
      if (singleProjectResult.success) {
        logSuccess(`Get single project - Status: ${singleProjectResult.status}`);
      } else {
        logError(`Get single project - Failed: ${singleProjectResult.error}`);
      }
    }
  } else {
    logError(`Get projects - Failed: ${projectsResult.error}`);
  }
}

// Test tasks module
async function testTasksModule() {
  if (!authToken) {
    logWarning('Skipping tasks tests - not authenticated');
    return;
  }

  log('\n=== Testing Tasks Module ===', 'blue');
  
  // Get tasks list
  logInfo('Testing get tasks list...');
  const tasksResult = await testEndpoint('GET', '/api/tasks', null, true);
  
  if (tasksResult.success) {
    logSuccess(`Get tasks - Status: ${tasksResult.status}, Count: ${tasksResult.data?.length || 0}`);
  } else {
    logError(`Get tasks - Failed: ${tasksResult.error}`);
  }
}

// Test invoices module
async function testInvoicesModule() {
  if (!authToken) {
    logWarning('Skipping invoices tests - not authenticated');
    return;
  }

  log('\n=== Testing Invoices Module ===', 'blue');
  
  // Get invoices list
  logInfo('Testing get invoices list...');
  const invoicesResult = await testEndpoint('GET', '/api/invoices', null, true);
  
  if (invoicesResult.success) {
    logSuccess(`Get invoices - Status: ${invoicesResult.status}, Count: ${invoicesResult.data?.length || 0}`);
  } else {
    logError(`Get invoices - Failed: ${invoicesResult.error}`);
  }
}

// Test time tracking module
async function testTimeTrackingModule() {
  if (!authToken) {
    logWarning('Skipping time tracking tests - not authenticated');
    return;
  }

  log('\n=== Testing Time Tracking Module ===', 'blue');
  
  // Get time entries
  logInfo('Testing get time entries...');
  const timeEntriesResult = await testEndpoint('GET', '/api/time-tracking', null, true);
  
  if (timeEntriesResult.success) {
    logSuccess(`Get time entries - Status: ${timeEntriesResult.status}, Count: ${timeEntriesResult.data?.length || 0}`);
  } else {
    logError(`Get time entries - Failed: ${timeEntriesResult.error}`);
  }
}

// Test reports module
async function testReportsModule() {
  if (!authToken) {
    logWarning('Skipping reports tests - not authenticated');
    return;
  }

  log('\n=== Testing Reports Module ===', 'blue');
  
  // Get reports
  logInfo('Testing get reports...');
  const reportsResult = await testEndpoint('GET', '/api/reports', null, true);
  
  if (reportsResult.success) {
    logSuccess(`Get reports - Status: ${reportsResult.status}`);
  } else {
    logError(`Get reports - Failed: ${reportsResult.error}`);
  }
}

// Test notifications
async function testNotifications() {
  if (!authToken) {
    logWarning('Skipping notifications tests - not authenticated');
    return;
  }

  log('\n=== Testing Notifications ===', 'blue');
  
  // Get notifications
  logInfo('Testing get notifications...');
  const notificationsResult = await testEndpoint('GET', '/api/notifications', null, true);
  
  if (notificationsResult.success) {
    logSuccess(`Get notifications - Status: ${notificationsResult.status}, Count: ${notificationsResult.data?.length || 0}`);
  } else {
    logError(`Get notifications - Failed: ${notificationsResult.error}`);
  }
}

// Test profile
async function testProfile() {
  if (!authToken) {
    logWarning('Skipping profile tests - not authenticated');
    return;
  }

  log('\n=== Testing Profile ===', 'blue');
  
  // Get profile
  logInfo('Testing get profile...');
  const profileResult = await testEndpoint('GET', '/api/auth/me', null, true);
  
  if (profileResult.success) {
    logSuccess(`Get profile - Status: ${profileResult.status}`);
  } else {
    logError(`Get profile - Failed: ${profileResult.error}`);
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Frontend Pages & API Endpoints Test Suite         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  logInfo(`Frontend URL: ${FRONTEND_URL}`);
  logInfo(`Backend URL: ${BACKEND_URL}`);
  
  try {
    // Test authentication first
    const isAuthenticated = await testAuthentication();
    
    // Test public pages (don't require auth)
    await testPublicPages();
    
    // Test authenticated features
    if (isAuthenticated) {
      await testDashboardFeatures();
      await testClientsModule();
      await testProjectsModule();
      await testTasksModule();
      await testInvoicesModule();
      await testTimeTrackingModule();
      await testReportsModule();
      await testNotifications();
      await testProfile();
    }
    
    log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    log('║              Test Suite Complete                       ║', 'cyan');
    log('╚════════════════════════════════════════════════════════╝', 'cyan');
    
  } catch (error) {
    logError(`\nTest suite failed with error: ${error.message}`);
    console.error(error);
  }
}

// Run the tests
runAllTests().catch(console.error);
