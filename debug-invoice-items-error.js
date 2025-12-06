const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function debugInvoiceItemsError() {
  try {
    console.log('Debugging invoice items 500 error...\n');
    
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Logged in successfully\n');
    
    // Try to fetch items for invoice ID 4
    console.log('2. Fetching items for invoice ID 4...');
    try {
      const itemsResponse = await axios.get(`${API_URL}/invoices/4/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✓ Success! Response:', JSON.stringify(itemsResponse.data, null, 2));
    } catch (error) {
      console.error('✗ Error fetching items:');
      console.error('Status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Full error:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugInvoiceItemsError();
