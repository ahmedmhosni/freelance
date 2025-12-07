const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000';
const TEST_EMAIL = 'ahmedmhosni90@gmail.com';
const TEST_PASSWORD = 'Test1234!@#';

async function testInvoicePDF() {
  console.log('\n=== Testing Invoice PDF Generation ===\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/v2/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.token;
    console.log('✓ Logged in successfully');

    // Step 2: Get invoices
    console.log('\n2. Fetching invoices...');
    const invoicesResponse = await axios.get(`${API_URL}/api/v2/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const invoices = invoicesResponse.data;
    console.log(`✓ Found ${invoices.length} invoices`);

    if (invoices.length === 0) {
      console.log('\n⚠️ No invoices found. Create an invoice first.');
      return;
    }

    // Step 3: Download PDF for first invoice
    const invoice = invoices[0];
    console.log(`\n3. Downloading PDF for invoice #${invoice.invoice_number || invoice.invoiceNumber}...`);
    console.log(`   Invoice ID: ${invoice.id}`);

    const pdfResponse = await axios.get(
      `${API_URL}/api/v2/invoices/${invoice.id}/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      }
    );

    // Step 4: Save PDF to file
    const filename = `invoice-${invoice.id}-test.pdf`;
    fs.writeFileSync(filename, pdfResponse.data);
    console.log(`✓ PDF downloaded successfully`);
    console.log(`   Saved as: ${filename}`);
    console.log(`   Size: ${(pdfResponse.data.length / 1024).toFixed(2)} KB`);

    // Step 5: Test multiple invoices
    if (invoices.length > 1) {
      console.log(`\n4. Testing with ${Math.min(3, invoices.length)} invoices...`);
      for (let i = 0; i < Math.min(3, invoices.length); i++) {
        const inv = invoices[i];
        try {
          const response = await axios.get(
            `${API_URL}/api/v2/invoices/${inv.id}/pdf`,
            {
              headers: { Authorization: `Bearer ${token}` },
              responseType: 'arraybuffer'
            }
          );
          console.log(`   ✓ Invoice #${inv.invoice_number || inv.invoiceNumber}: ${(response.data.length / 1024).toFixed(2)} KB`);
        } catch (error) {
          console.log(`   ✗ Invoice #${inv.invoice_number || inv.invoiceNumber}: ${error.message}`);
        }
      }
    }

    console.log('\n✅ PDF GENERATION WORKING!');
    console.log(`\nOpen ${filename} to view the generated PDF.`);

  } catch (error) {
    console.log('\n❌ Test failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testInvoicePDF();
