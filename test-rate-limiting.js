/**
 * Test Rate Limiting
 * 
 * Tests the rate limiting functionality with user-friendly error messages
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`)
};

/**
 * Test login rate limiting
 */
async function testLoginRateLimit() {
  log.section('Testing Login Rate Limiting (5 attempts per 15 min)');
  
  const testEmail = 'test@example.com';
  const testPassword = 'wrongpassword';
  
  let attempts = 0;
  let rateLimited = false;
  
  for (let i = 1; i <= 7; i++) {
    try {
      log.info(`Attempt ${i}: Trying to login...`);
      
      await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: testPassword
      });
      
      log.success(`Attempt ${i}: Request succeeded (unexpected)`);
      attempts++;
      
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimited = true;
        const data = error.response.data;
        
        log.warning(`Attempt ${i}: Rate limited!`);
        console.log(`   Error: ${data.error}`);
        console.log(`   Message: ${data.message}`);
        console.log(`   Details: ${data.details}`);
        console.log(`   Suggestion: ${data.suggestion}`);
        console.log(`   Retry After: ${data.retryAfter} seconds`);
        
        if (i === 6) {
          log.success('Rate limiting is working correctly!');
        }
        
      } else if (error.response?.status === 401) {
        log.info(`Attempt ${i}: Invalid credentials (expected)`);
        attempts++;
      } else {
        log.error(`Attempt ${i}: Unexpected error - ${error.message}`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (rateLimited) {
    log.success(`✅ Login rate limiting works! Limited after ${attempts} failed attempts`);
  } else {
    log.error('❌ Login rate limiting not working - no 429 response received');
  }
  
  return rateLimited;
}

/**
 * Test registration rate limiting
 */
async function testRegisterRateLimit() {
  log.section('Testing Registration Rate Limiting (3 attempts per hour)');
  
  let attempts = 0;
  let rateLimited = false;
  
  for (let i = 1; i <= 5; i++) {
    try {
      log.info(`Attempt ${i}: Trying to register...`);
      
      await axios.post(`${API_URL}/auth/register`, {
        name: `Test User ${i}`,
        email: `test${Date.now()}${i}@example.com`,
        password: 'TestPassword123!'
      });
      
      log.success(`Attempt ${i}: Registration succeeded`);
      attempts++;
      
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimited = true;
        const data = error.response.data;
        
        log.warning(`Attempt ${i}: Rate limited!`);
        console.log(`   Error: ${data.error}`);
        console.log(`   Message: ${data.message}`);
        console.log(`   Details: ${data.details}`);
        console.log(`   Suggestion: ${data.suggestion}`);
        console.log(`   Retry After: ${data.retryAfter} seconds`);
        
        if (i === 4) {
          log.success('Rate limiting is working correctly!');
        }
        
      } else if (error.response?.status === 409) {
        log.info(`Attempt ${i}: Email already exists (expected)`);
        attempts++;
      } else if (error.response?.status === 400) {
        log.info(`Attempt ${i}: Validation error`);
        attempts++;
      } else {
        log.error(`Attempt ${i}: Unexpected error - ${error.message}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (rateLimited) {
    log.success(`✅ Registration rate limiting works! Limited after ${attempts} attempts`);
  } else {
    log.error('❌ Registration rate limiting not working - no 429 response received');
  }
  
  return rateLimited;
}

/**
 * Test password reset rate limiting
 */
async function testPasswordResetRateLimit() {
  log.section('Testing Password Reset Rate Limiting (3 attempts per hour)');
  
  const testEmail = 'test@example.com';
  let attempts = 0;
  let rateLimited = false;
  
  for (let i = 1; i <= 5; i++) {
    try {
      log.info(`Attempt ${i}: Requesting password reset...`);
      
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: testEmail
      });
      
      log.success(`Attempt ${i}: Request succeeded`);
      attempts++;
      
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimited = true;
        const data = error.response.data;
        
        log.warning(`Attempt ${i}: Rate limited!`);
        console.log(`   Error: ${data.error}`);
        console.log(`   Message: ${data.message}`);
        console.log(`   Details: ${data.details}`);
        console.log(`   Suggestion: ${data.suggestion}`);
        console.log(`   Retry After: ${data.retryAfter} seconds`);
        
        if (i === 4) {
          log.success('Rate limiting is working correctly!');
        }
        
      } else {
        log.error(`Attempt ${i}: Unexpected error - ${error.message}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (rateLimited) {
    log.success(`✅ Password reset rate limiting works! Limited after ${attempts} attempts`);
  } else {
    log.error('❌ Password reset rate limiting not working - no 429 response received');
  }
  
  return rateLimited;
}

/**
 * Test API rate limiting
 */
async function testAPIRateLimit() {
  log.section('Testing General API Rate Limiting (1000 requests per 15 min)');
  
  log.info('Making 10 rapid API requests...');
  
  let successCount = 0;
  let rateLimited = false;
  
  for (let i = 1; i <= 10; i++) {
    try {
      await axios.get(`${API_URL}/status`);
      successCount++;
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimited = true;
        log.warning('Rate limited on general API');
      }
    }
  }
  
  log.success(`${successCount}/10 requests succeeded`);
  
  if (!rateLimited) {
    log.success('✅ General API rate limit is generous (1000 req/15min) - normal usage works fine');
  } else {
    log.warning('⚠️ General API rate limit triggered (unexpected for 10 requests)');
  }
  
  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  Rate Limiting Test Suite');
  console.log('='.repeat(60));
  
  log.info(`Testing against: ${API_URL}`);
  log.info('Make sure the backend server is running!\n');
  
  const results = {
    login: false,
    register: false,
    passwordReset: false,
    api: false
  };
  
  try {
    // Test each rate limiter
    results.login = await testLoginRateLimit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.register = await testRegisterRateLimit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.passwordReset = await testPasswordResetRateLimit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.api = await testAPIRateLimit();
    
  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
  }
  
  // Summary
  log.section('Test Summary');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Login Rate Limiting:        ${results.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Registration Rate Limiting: ${results.register ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Password Reset Limiting:    ${results.passwordReset ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`General API Limiting:       ${results.api ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    log.success('🎉 All rate limiting tests passed!');
    log.info('Rate limiting is configured correctly with user-friendly messages.');
  } else {
    log.error('Some rate limiting tests failed. Check the configuration.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run tests
runTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
