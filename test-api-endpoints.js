// Test API endpoints directly
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const credentials = {
  email: 'ahmedmhosni90@gmail.com',
  password: '123456'
};

async function testEndpoints() {
  console.log('========================================');
  console.log('API Endpoint Testing');
  console.log('========================================\n');

  try {
    // Step 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, credentials);
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Create axios instance with auth
    const api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n2. Testing Clients endpoint...');
    try {
      const clientsResponse = await api.get('/clients');
      console.log(`   ✅ Clients: ${clientsResponse.data.length || clientsResponse.data.clients?.length || 0} found`);
    } catch (error) {
      console.log(`   ❌ Clients failed: ${error.response?.status} ${error.response?.statusText}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n3. Testing Projects endpoint...');
    try {
      const projectsResponse = await api.get('/projects');
      console.log(`   ✅ Projects: ${projectsResponse.data.length || projectsResponse.data.projects?.length || 0} found`);
    } catch (error) {
      console.log(`   ❌ Projects failed: ${error.response?.status} ${error.response?.statusText}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n4. Testing Tasks endpoint...');
    try {
      const tasksResponse = await api.get('/tasks');
      console.log(`   ✅ Tasks: ${tasksResponse.data.length || tasksResponse.data.tasks?.length || 0} found`);
    } catch (error) {
      console.log(`   ❌ Tasks failed: ${error.response?.status} ${error.response?.statusText}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n5. Testing Invoices endpoint...');
    try {
      const invoicesResponse = await api.get('/invoices');
      console.log(`   ✅ Invoices: ${invoicesResponse.data.length || invoicesResponse.data.invoices?.length || 0} found`);
    } catch (error) {
      console.log(`   ❌ Invoices failed: ${error.response?.status} ${error.response?.statusText}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n6. Testing Time Tracking endpoint...');
    try {
      const timeResponse = await api.get('/time-tracking');
      console.log(`   ✅ Time entries: ${timeResponse.data.length || timeResponse.data.entries?.length || 0} found`);
    } catch (error) {
      console.log(`   ❌ Time tracking failed: ${error.response?.status} ${error.response?.statusText}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n========================================');
    console.log('Summary:');
    console.log('If you see ✅ for all endpoints, the API is working!');
    console.log('If you see ❌, check the backend console for errors.');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Login failed!');
    console.error(`Error: ${error.response?.data?.message || error.message}`);
    console.error('\nPossible issues:');
    console.error('- Backend server not running');
    console.error('- Wrong credentials');
    console.error('- Database connection issue');
  }
}

testEndpoints();
