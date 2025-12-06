const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'test@test.com',
  password: 'TestPassword123!'
};

async function testTimeTrackingEndpoints() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ Login successful');
    console.log('Token:', token ? 'received' : 'missing');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test 1: Get summary
    console.log('\n📊 Testing /api/time-tracking/summary...');
    try {
      const summaryResponse = await axios.get(`${BASE_URL}/time-tracking/summary`, config);
      console.log('✅ Summary endpoint works:', summaryResponse.data);
    } catch (error) {
      console.error('❌ Summary endpoint failed:', error.response?.status, error.response?.data);
    }

    // Test 2: Get grouped data by task
    console.log('\n📊 Testing /api/time-tracking/grouped?group_by=task...');
    try {
      const groupedResponse = await axios.get(`${BASE_URL}/time-tracking/grouped?group_by=task`, config);
      console.log('✅ Grouped endpoint works:', groupedResponse.data);
    } catch (error) {
      console.error('❌ Grouped endpoint failed:', error.response?.status, error.response?.data);
    }

    // Test 3: Get grouped data by project
    console.log('\n📊 Testing /api/time-tracking/grouped?group_by=project...');
    try {
      const groupedResponse = await axios.get(`${BASE_URL}/time-tracking/grouped?group_by=project`, config);
      console.log('✅ Grouped by project works:', groupedResponse.data);
    } catch (error) {
      console.error('❌ Grouped by project failed:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testTimeTrackingEndpoints();
