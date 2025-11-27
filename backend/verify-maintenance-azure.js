const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

async function verifyMaintenance() {
  try {
    console.log('🔍 Checking maintenance_content table...\n');
    
    // Check table structure
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'maintenance_content'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table Structure:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check data
    const data = await pool.query('SELECT * FROM maintenance_content');
    console.log(`\n📊 Records: ${data.rows.length}`);
    if (data.rows.length > 0) {
      console.log('\n✓ Sample record:');
      console.log(`   ID: ${data.rows[0].id}`);
      console.log(`   Title: ${data.rows[0].title}`);
      console.log(`   Message: ${data.rows[0].message?.substring(0, 50)}...`);
      console.log(`   Is Active: ${data.rows[0].is_active}`);
    }
    
    console.log('\n✅ Maintenance table is ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMaintenance();
