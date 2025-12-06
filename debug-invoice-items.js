/**
 * Debug invoice items issue
 * This script will help identify where the 500 error is coming from
 */

console.log('=== Invoice Items Debug ===\n');

// Test 1: Check if modules load
console.log('1. Testing module loading...');
try {
  const InvoiceItemRepository = require('./backend/src/modules/invoices/repositories/InvoiceItemRepository');
  const InvoiceItemService = require('./backend/src/modules/invoices/services/InvoiceItemService');
  const InvoiceController = require('./backend/src/modules/invoices/controllers/InvoiceController');
  console.log('   ✓ All modules load successfully\n');
} catch (error) {
  console.error('   ✗ Module loading failed:', error.message);
  process.exit(1);
}

// Test 2: Check database connection
console.log('2. Testing database connection...');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env
function loadEnv() {
  const envPath = path.join(__dirname, 'backend/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres123',
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function debug() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('   ✓ Database connection successful\n');
    
    // Test 3: Check if invoice_items table exists
    console.log('3. Checking invoice_items table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invoice_items'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('   ✓ invoice_items table exists\n');
    } else {
      console.log('   ✗ invoice_items table does NOT exist');
      console.log('   Run: node backend/apply-invoice-items-postgres.js\n');
      await pool.end();
      process.exit(1);
    }
    
    // Test 4: Check if invoices table exists
    console.log('4. Checking invoices table...');
    const invoicesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices'
      );
    `);
    
    if (invoicesCheck.rows[0].exists) {
      console.log('   ✓ invoices table exists\n');
      
      // Check if invoice ID 2 exists
      const invoiceCheck = await pool.query('SELECT id FROM invoices WHERE id = 2');
      if (invoiceCheck.rows.length > 0) {
        console.log('   ✓ Invoice ID 2 exists\n');
      } else {
        console.log('   ⚠️  Invoice ID 2 does NOT exist');
        console.log('   The frontend is trying to fetch items for a non-existent invoice\n');
      }
    } else {
      console.log('   ✗ invoices table does NOT exist\n');
    }
    
    // Test 5: Try a simple query
    console.log('5. Testing invoice_items query...');
    try {
      const result = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [2]);
      console.log(`   ✓ Query successful, found ${result.rows.length} items\n`);
    } catch (error) {
      console.log('   ✗ Query failed:', error.message, '\n');
    }
    
    // Test 6: Check for common issues
    console.log('6. Checking for common issues...');
    
    // Check if projects table exists (for LEFT JOIN)
    const projectsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      );
    `);
    
    if (!projectsCheck.rows[0].exists) {
      console.log('   ⚠️  projects table does NOT exist (LEFT JOIN will fail)\n');
    } else {
      console.log('   ✓ projects table exists');
    }
    
    // Check if tasks table exists (for LEFT JOIN)
    const tasksCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
      );
    `);
    
    if (!tasksCheck.rows[0].exists) {
      console.log('   ⚠️  tasks table does NOT exist (LEFT JOIN will fail)\n');
    } else {
      console.log('   ✓ tasks table exists\n');
    }
    
    console.log('=== Debug Complete ===\n');
    console.log('Summary:');
    console.log('- Modules load correctly');
    console.log('- Database connection works');
    console.log('- invoice_items table exists');
    console.log('\nIf you\'re still getting 500 errors, check the backend server logs for the actual error message.');
    console.log('The error is likely in the service layer or authentication.');
    
  } catch (error) {
    console.error('\n✗ Debug failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

debug();
