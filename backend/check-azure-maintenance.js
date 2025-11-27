const { Pool } = require('pg');

// Azure PostgreSQL credentials
const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

async function checkMaintenance() {
  try {
    console.log('🔍 Checking Azure maintenance_content table...\n');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'maintenance_content'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table does not exist!');
      return;
    }
    
    console.log('✓ Table exists');
    
    // Check table structure
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'maintenance_content'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table Structure:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check data
    const data = await pool.query('SELECT * FROM maintenance_content');
    console.log(`\n📊 Records: ${data.rows.length}`);
    
    if (data.rows.length > 0) {
      console.log('\n✓ Sample record:');
      const record = data.rows[0];
      console.log(`   ID: ${record.id}`);
      console.log(`   Title: ${record.title}`);
      console.log(`   Message: ${record.message?.substring(0, 80)}...`);
      console.log(`   Is Active: ${record.is_active}`);
      console.log(`   Created: ${record.created_at}`);
    }
    
    console.log('\n✅ Maintenance table is ready on Azure!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMaintenance();
