/**
 * Test Invoice Items API
 * Tests the new invoice items endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'Test123!'
};

async function login() {
  try {
    console.log('1. Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✓ Login successful\n');
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function getInvoices() {
  try {
    console.log('2. Getting invoices...');
    const response = await axios.get(`${API_URL}/invoices`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const invoices = response.data;
    console.log(`✓ Found ${invoices.length} invoices`);
    
    if (invoices.length > 0) {
      console.log(`   First invoice: ID=${invoices[0].id}, Number=${invoices[0].invoiceNumber}\n`);
      return invoices[0].id;
    }
    
    console.log('   No invoices found. Creating one...\n');
    return null;
  } catch (error) {
    console.error('✗ Failed to get invoices:', error.response?.data || error.message);
    return null;
  }
}

async function createInvoice() {
  try {
    console.log('3. Creating test invoice...');
    
    // First get a client
    const clientsResponse = await axios.get(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (clientsResponse.data.length === 0) {
      console.log('   No clients found. Please create a client first.');
      return null;
    }
    
    const clientId = clientsResponse.data[0].id;
    
    const invoiceData = {
      client_id: clientId,
      invoice_number: `TEST-${Date.now()}`,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0
    };
    
    const response = await axios.post(`${API_URL}/invoices`, invoiceData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✓ Invoice created: ID=${response.data.id}\n`);
    return response.data.id;
  } catch (error) {
    console.error('✗ Failed to create invoice:', error.response?.data || error.message);
    return null;
  }
}

async function testInvoiceItems(invoiceId) {
  try {
    console.log(`4. Testing invoice items for invoice ${invoiceId}...\n`);
    
    // Test 1: Get items (should be empty)
    console.log('   a) Getting items (should be empty)...');
    let response = await axios.get(`${API_URL}/invoices/${invoiceId}/items`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✓ Got ${response.data.length} items\n`);
    
    // Test 2: Create a fixed price item
    console.log('   b) Creating fixed price item...');
    const fixedItem = {
      description: 'Website Development',
      quantity: 1,
      unit_price: 1500.00
    };
    
    response = await axios.post(`${API_URL}/invoices/${invoiceId}/items`, fixedItem, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const fixedItemId = response.data.id;
    console.log(`   ✓ Fixed item created: ID=${fixedItemId}, Amount=$${response.data.amount}\n`);
    
    // Test 3: Create an hourly item
    console.log('   c) Creating hourly item...');
    const hourlyItem = {
      description: 'Consulting Services',
      hours_worked: 10,
      rate_per_hour: 75.00
    };
    
    response = await axios.post(`${API_URL}/invoices/${invoiceId}/items`, hourlyItem, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const hourlyItemId = response.data.id;
    console.log(`   ✓ Hourly item created: ID=${hourlyItemId}, Amount=$${response.data.amount}\n`);
    
    // Test 4: Get all items
    console.log('   d) Getting all items...');
    response = await axios.get(`${API_URL}/invoices/${invoiceId}/items`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✓ Got ${response.data.length} items:`);
    response.data.forEach(item => {
      console.log(`      - ${item.description}: $${item.amount} (${item.type})`);
    });
    console.log();
    
    // Test 5: Update an item
    console.log('   e) Updating fixed item...');
    response = await axios.put(
      `${API_URL}/invoices/${invoiceId}/items/${fixedItemId}`,
      { unit_price: 2000.00 },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`   ✓ Item updated: New amount=$${response.data.amount}\n`);
    
    // Test 6: Delete an item
    console.log('   f) Deleting hourly item...');
    await axios.delete(`${API_URL}/invoices/${invoiceId}/items/${hourlyItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✓ Item deleted\n`);
    
    // Test 7: Verify deletion
    console.log('   g) Verifying deletion...');
    response = await axios.get(`${API_URL}/invoices/${invoiceId}/items`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✓ Remaining items: ${response.data.length}\n`);
    
    // Test 8: Check invoice total was updated
    console.log('   h) Checking invoice total...');
    response = await axios.get(`${API_URL}/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✓ Invoice total: $${response.data.amount}\n`);
    
    console.log('✓ All invoice items tests passed!\n');
    return true;
  } catch (error) {
    console.error('✗ Invoice items test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('   Validation errors:', error.response.data.errors);
    }
    return false;
  }
}

async function runTests() {
  console.log('=== Invoice Items API Test ===\n');
  
  // Login
  if (!await login()) {
    console.log('\nTests aborted: Login failed');
    return;
  }
  
  // Get or create invoice
  let invoiceId = await getInvoices();
  if (!invoiceId) {
    invoiceId = await createInvoice();
  }
  
  if (!invoiceId) {
    console.log('\nTests aborted: No invoice available');
    return;
  }
  
  // Test invoice items
  await testInvoiceItems(invoiceId);
  
  console.log('=== Tests Complete ===');
}

runTests();
