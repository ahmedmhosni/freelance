/**
 * Test script to verify client detail API response structure
 * Run with: node test-client-detail-api.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const CLIENT_ID = 70165; // Replace with a valid client ID

async function testClientDetailAPI() {
  try {
    console.log('🔍 Testing Client Detail API...\n');
    
    // You'll need to replace this with a valid token
    const token = 'YOUR_AUTH_TOKEN_HERE';
    
    const response = await axios.get(`${API_URL}/clients/${CLIENT_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API Response received\n');
    console.log('Response structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📊 Analysis:');
    console.log('- response.data:', typeof response.data);
    console.log('- response.data.success:', response.data.success);
    console.log('- response.data.data:', typeof response.data.data);
    
    if (response.data.data) {
      console.log('\n✅ Client data is nested in response.data.data');
      console.log('Client name:', response.data.data.name);
      console.log('Client email:', response.data.data.email);
    } else {
      console.log('\n⚠️  Client data is directly in response.data');
      console.log('Client name:', response.data.name);
      console.log('Client email:', response.data.email);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

console.log('📝 Instructions:');
console.log('1. Make sure the backend server is running on port 5000');
console.log('2. Replace YOUR_AUTH_TOKEN_HERE with a valid JWT token');
console.log('3. Replace CLIENT_ID with a valid client ID from your database');
console.log('4. Run: node test-client-detail-api.js\n');

// Uncomment to run the test
// testClientDetailAPI();

module.exports = { testClientDetailAPI };
