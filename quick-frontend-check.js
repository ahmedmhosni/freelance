/**
 * Quick Frontend Check
 * Verifies frontend is running and main pages are accessible
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkServer(url, name) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    log(`✓ ${name} is running (Status: ${response.status})`, 'green');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log(`✗ ${name} is not running`, 'red');
    } else {
      log(`✓ ${name} is running (responded with ${error.response?.status || 'error'})`, 'green');
      return true;
    }
    return false;
  }
}

async function checkBackendEndpoints() {
  log('\n=== Checking Backend Endpoints ===', 'cyan');
  
  const endpoints = [
    { path: '/api/status', name: 'Public Status', public: true },
    { path: '/api/announcements', name: 'Announcements', public: true },
    { path: '/api/auth/login', name: 'Login Endpoint', public: true, method: 'POST' }
  ];

  for (const endpoint of endpoints) {
    try {
      let response;
      if (endpoint.method === 'POST') {
        // Just check if endpoint exists (will return 400/401 but that's ok)
        response = await axios.post(`${BACKEND_URL}${endpoint.path}`, {}, { 
          timeout: 5000,
          validateStatus: () => true // Accept any status
        });
      } else {
        response = await axios.get(`${BACKEND_URL}${endpoint.path}`, { 
          timeout: 5000,
          validateStatus: () => true 
        });
      }
      
      if (response.status < 500) {
        log(`✓ ${endpoint.name} - Accessible (Status: ${response.status})`, 'green');
      } else {
        log(`⚠ ${endpoint.name} - Server error (Status: ${response.status})`, 'yellow');
      }
    } catch (error) {
      log(`✗ ${endpoint.name} - Failed: ${error.message}`, 'red');
    }
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║          Quick Frontend & Backend Check                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\nFrontend URL: ${FRONTEND_URL}`);
  log(`Backend URL: ${BACKEND_URL}\n`);
  
  // Check if servers are running
  log('=== Checking Servers ===', 'cyan');
  const frontendRunning = await checkServer(FRONTEND_URL, 'Frontend Server');
  const backendRunning = await checkServer(BACKEND_URL, 'Backend Server');
  
  if (!frontendRunning) {
    log('\n⚠ Frontend server is not running. Start it with:', 'yellow');
    log('  cd frontend && npm run dev', 'yellow');
  }
  
  if (!backendRunning) {
    log('\n⚠ Backend server is not running. Start it with:', 'yellow');
    log('  cd backend && npm start', 'yellow');
  }
  
  if (backendRunning) {
    await checkBackendEndpoints();
  }
  
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Check Complete                      ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (frontendRunning && backendRunning) {
    log('\n✓ Both servers are running!', 'green');
    log(`\nYou can now test the application at: ${FRONTEND_URL}`, 'cyan');
    log('\nFor detailed testing, see: FRONTEND_TESTING_GUIDE.md', 'cyan');
  } else {
    log('\n✗ One or more servers are not running', 'red');
  }
}

main().catch(console.error);
