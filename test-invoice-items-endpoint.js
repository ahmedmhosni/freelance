/**
 * Test invoice items endpoint directly
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEndpoint() {
  try {
    console.log('Testing invoice items endpoint...\n');
    
    // First, try to login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful\n');
    
    // Try to get invoice items for invoice ID 2
    console.log('2. Getting invoice items for invoice ID 2...');
    try {
      const response = await axios.get(`${API_URL}/invoices/2/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✓ Success!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('✗ Failed with status:', error.response?.status);
      console.log('Error response:', JSON.stringify(error.response?.data, null, 2));
      console.log('\nFull error:', error.message);
      
      if (error.response?.status === 500) {
        console.log('\n⚠️  500 Internal Server Error');
        console.log('Check the backend server logs for the actual error.');
        console.log('The error is likely in:');
        console.log('  - InvoiceItemService.getItemsForInvoice()');
        console.log('  - InvoiceItemRepository.getByInvoiceId()');
        console.log('  - Database query execution');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testEndpoint();
