const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testClientsEndpoint() {
  try {
    console.log('========================================');
    console.log('Testing Clients Endpoint');
    console.log('========================================\n');

    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ahmedmhosni90@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Step 2: Test clients endpoint with detailed error handling
    console.log('2. Testing /api/clients endpoint...');
    console.log('   Making request with Authorization header...');
    
    const startTime = Date.now();
    
    try {
      const clientsResponse = await axios.get(`${BASE_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });
      
      const endTime = Date.now();
      console.log(`   ✅ Response received in ${endTime - startTime}ms`);
      console.log(`   Status: ${clientsResponse.status}`);
      console.log(`   Data:`, JSON.stringify(clientsResponse.data, null, 2));
      
    } catch (error) {
      const endTime = Date.now();
      console.log(`   ❌ Request failed after ${endTime - startTime}ms`);
      
      if (error.code === 'ECONNABORTED') {
        console.log('   Error: Request timeout - server not responding');
      } else if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error:`, error.response.data);
      } else if (error.request) {
        console.log('   Error: No response received from server');
        console.log('   This usually means the request was sent but server never responded');
      } else {
        console.log('   Error:', error.message);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testClientsEndpoint();
