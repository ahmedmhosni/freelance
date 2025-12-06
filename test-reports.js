const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'test@test.com',
  password: 'TestPassword123!'
};

async function testReports() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ Login successful\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test 1: Financial Report
    console.log('📊 Testing Financial Report...');
    try {
      const financialResponse = await axios.get(`${BASE_URL}/reports/financial`, config);
      console.log('✅ Financial Report:', {
        totalInvoices: financialResponse.data.totalInvoices,
        totalRevenue: financialResponse.data.totalRevenue,
        pendingAmount: financialResponse.data.pendingAmount
      });
    } catch (error) {
      console.error('❌ Financial Report failed:', error.response?.status, error.response?.data || error.message);
    }

    // Test 2: Projects Report
    console.log('\n📊 Testing Projects Report...');
    try {
      const projectsResponse = await axios.get(`${BASE_URL}/reports/projects`, config);
      console.log('✅ Projects Report:', {
        totalProjects: projectsResponse.data.totalProjects,
        totalTasks: projectsResponse.data.totalTasks
      });
    } catch (error) {
      console.error('❌ Projects Report failed:', error.response?.status, error.response?.data || error.message);
    }

    // Test 3: Clients Report
    console.log('\n📊 Testing Clients Report...');
    try {
      const clientsResponse = await axios.get(`${BASE_URL}/reports/clients`, config);
      console.log('✅ Clients Report:', `${clientsResponse.data.length} clients`);
    } catch (error) {
      console.error('❌ Clients Report failed:', error.response?.status, error.response?.data || error.message);
    }

    // Test 4: Time Tracking by Tasks
    console.log('\n📊 Testing Time Tracking by Tasks...');
    try {
      const tasksResponse = await axios.get(`${BASE_URL}/reports/time-tracking/tasks`, config);
      console.log('✅ Time Tracking by Tasks:', `${tasksResponse.data.length} tasks`);
    } catch (error) {
      console.error('❌ Time Tracking by Tasks failed:', error.response?.status, error.response?.data || error.message);
    }

    // Test 5: Time Tracking by Projects
    console.log('\n📊 Testing Time Tracking by Projects...');
    try {
      const projectsResponse = await axios.get(`${BASE_URL}/reports/time-tracking/projects`, config);
      console.log('✅ Time Tracking by Projects:', `${projectsResponse.data.length} projects`);
    } catch (error) {
      console.error('❌ Time Tracking by Projects failed:', error.response?.status, error.response?.data || error.message);
    }

    // Test 6: Time Tracking by Clients
    console.log('\n📊 Testing Time Tracking by Clients...');
    try {
      const clientsResponse = await axios.get(`${BASE_URL}/reports/time-tracking/clients`, config);
      console.log('✅ Time Tracking by Clients:', `${clientsResponse.data.length} clients`);
    } catch (error) {
      console.error('❌ Time Tracking by Clients failed:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Reports testing complete!');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testReports();
