// Test production API endpoints
const axios = require('axios');

const API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

async function testEndpoint(endpoint, description) {
  console.log(`\nTesting: ${description}`);
  console.log(`Endpoint: ${endpoint}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${API_URL}${endpoint}`, {
      timeout: 10000, // 10 second timeout
      validateStatus: () => true // Accept any status code
    });
    const duration = Date.now() - startTime;
    
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Duration: ${duration}ms`);
    console.log(`✓ Response:`, JSON.stringify(response.data).substring(0, 200));
    return { success: true, status: response.status, duration };
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    if (error.code === 'ECONNABORTED') {
      console.log(`✗ Request timed out after 10 seconds`);
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('PRODUCTION API HEALTH CHECK');
  console.log('='.repeat(60));
  
  const tests = [
    { endpoint: '/health', description: 'Health Check' },
    { endpoint: '/api/auth/check', description: 'Auth Check (should be 401)' },
    { endpoint: '/api/legal/terms', description: 'Legal Terms' },
    { endpoint: '/api/legal/privacy', description: 'Legal Privacy' },
    { endpoint: '/api/changelog/public', description: 'Public Changelog' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.description);
    results.push({ ...test, ...result });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between requests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.error}`);
    });
  }
  
  // Check for slow responses
  const slowResponses = results.filter(r => r.success && r.duration > 3000);
  if (slowResponses.length > 0) {
    console.log('\nSlow Responses (>3s):');
    slowResponses.forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.duration}ms`);
    });
  }
}

runTests().catch(console.error);
