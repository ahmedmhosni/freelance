const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testInvoiceItemsDisplay() {
  try {
    console.log('Testing invoice items display with project/task names...\n');
    
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Logged in successfully\n');
    
    // Get invoices
    console.log('2. Fetching invoices...');
    const invoicesResponse = await axios.get(`${API_URL}/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const invoices = invoicesResponse.data.data || invoicesResponse.data;
    console.log(`✓ Found ${invoices.length} invoices\n`);
    
    if (invoices.length === 0) {
      console.log('No invoices found. Please create an invoice with items first.');
      return;
    }
    
    // Get items for first invoice
    const invoice = invoices[0];
    console.log(`3. Fetching items for invoice ${invoice.invoice_number}...`);
    const itemsResponse = await axios.get(`${API_URL}/invoices/${invoice.id}/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const items = itemsResponse.data.data || itemsResponse.data;
    console.log(`✓ Found ${items.length} items\n`);
    
    if (items.length === 0) {
      console.log('No items found for this invoice.');
      return;
    }
    
    // Display items with project/task names
    console.log('4. Invoice Items Details:');
    console.log('─'.repeat(80));
    items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Project Name: ${item.project_name || 'N/A'}`);
      console.log(`  Task Name: ${item.task_name || 'N/A'}`);
      console.log(`  Type: ${item.type}`);
      console.log(`  Amount: $${parseFloat(item.amount).toFixed(2)}`);
    });
    console.log('\n' + '─'.repeat(80));
    
    // Check if names are present
    const itemsWithProjectNames = items.filter(i => i.project_name);
    const itemsWithTaskNames = items.filter(i => i.task_name);
    
    console.log(`\n✓ Items with project names: ${itemsWithProjectNames.length}/${items.length}`);
    console.log(`✓ Items with task names: ${itemsWithTaskNames.length}/${items.length}`);
    
    if (itemsWithProjectNames.length === 0 && itemsWithTaskNames.length === 0) {
      console.log('\n⚠ No project or task names found. This might be because:');
      console.log('  - Items were not linked to projects/tasks when created');
      console.log('  - The database join is not working correctly');
    } else {
      console.log('\n✓ SUCCESS: Project/task names are being returned correctly!');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testInvoiceItemsDisplay();
