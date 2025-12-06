/**
 * Verify invoice_items table in PostgreSQL
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '../backend/.env');
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

async function verify() {
  const client = await pool.connect();
  
  try {
    console.log('=== Invoice Items Table Verification ===\n');
    console.log(`Database: ${process.env.PG_DATABASE || 'roastify'}`);
    console.log(`Host: ${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || 5432}\n`);
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invoice_items'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ invoice_items table does NOT exist\n');
      console.log('To create it, run:');
      console.log('  node database/apply-invoice-items-postgres.js\n');
      process.exit(1);
    }
    
    console.log('✅ invoice_items table exists\n');
    
    // Get table structure
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'invoice_items'
      ORDER BY ordinal_position
    `);
    
    console.log('Table Structure:');
    console.log('─'.repeat(80));
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  ${col.column_name.padEnd(20)} ${(col.data_type + length).padEnd(20)} ${nullable}${defaultVal}`);
    });
    console.log('─'.repeat(80));
    
    // Check required columns
    const requiredColumns = [
      'id', 'invoice_id', 'project_id', 'task_id', 'description',
      'quantity', 'unit_price', 'hours_worked', 'rate_per_hour', 'amount', 'created_at'
    ];
    
    const existingColumns = columns.rows.map(c => c.column_name);
    const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  Missing columns:', missingColumns.join(', '));
      console.log('Run the migration to update the table structure.');
    } else {
      console.log('\n✅ All required columns present');
    }
    
    // Get indexes
    const indexes = await client.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'invoice_items'
      AND schemaname = 'public'
      ORDER BY indexname
    `);
    
    console.log('\nIndexes:');
    console.log('─'.repeat(80));
    if (indexes.rows.length === 0) {
      console.log('  No indexes found');
    } else {
      indexes.rows.forEach(idx => {
        console.log(`  ${idx.indexname}`);
        console.log(`    ${idx.indexdef}`);
      });
    }
    console.log('─'.repeat(80));
    
    // Get foreign keys
    const foreignKeys = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'invoice_items'
    `);
    
    console.log('\nForeign Keys:');
    console.log('─'.repeat(80));
    if (foreignKeys.rows.length === 0) {
      console.log('  No foreign keys found');
    } else {
      foreignKeys.rows.forEach(fk => {
        console.log(`  ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      });
    }
    console.log('─'.repeat(80));
    
    // Count existing items
    const countResult = await client.query('SELECT COUNT(*) as count FROM invoice_items');
    const itemCount = parseInt(countResult.rows[0].count);
    
    console.log(`\nTotal items in table: ${itemCount}`);
    
    if (itemCount > 0) {
      // Show sample data
      const sample = await client.query('SELECT * FROM invoice_items LIMIT 3');
      console.log('\nSample data:');
      console.log(JSON.stringify(sample.rows, null, 2));
    }
    
    console.log('\n✅ Verification complete!');
    console.log('\nAPI Endpoints available:');
    console.log('  GET    /api/invoices/:invoiceId/items');
    console.log('  POST   /api/invoices/:invoiceId/items');
    console.log('  PUT    /api/invoices/:invoiceId/items/:id');
    console.log('  DELETE /api/invoices/:invoiceId/items/:id');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verify();
