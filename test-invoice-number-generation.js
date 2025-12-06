const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testInvoiceNumberGeneration() {
  try {
    console.log('Testing invoice number generation...\n');
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'TestPassword123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Logged in\n');
    
    // Get all invoices
    const invoicesResponse = await axios.get(`${API_URL}/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const invoices = invoicesResponse.data.data || invoicesResponse.data;
    console.log(`Found ${invoices.length} existing invoices\n`);
    
    if (invoices.length > 0) {
      console.log('Existing invoice numbers:');
      invoices.forEach(inv => {
        console.log(`  - ${inv.invoiceNumber || inv.invoice_number} (ID: ${inv.id})`);
      });
      console.log('');
      
      // Test the generation logic
      const numbers = invoices
        .map(inv => {
          const invoiceNum = inv.invoiceNumber || inv.invoice_number;
          const match = invoiceNum?.match(/INV-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      console.log('Extracted numbers:', numbers);
      
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      const nextNumber = maxNumber + 1;
      const nextInvoiceNumber = `INV-${String(nextNumber).padStart(4, '0')}`;
      
      console.log(`Max number: ${maxNumber}`);
      console.log(`Next number should be: ${nextInvoiceNumber}`);
    } else {
      console.log('No invoices found. Next number should be: INV-0001');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testInvoiceNumberGeneration();
