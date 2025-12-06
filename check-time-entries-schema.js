const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123'
});

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'time_entries' 
      ORDER BY ordinal_position
    `);
    
    console.log('Time Entries Table Columns:');
    console.log('═══════════════════════════════════════');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('═══════════════════════════════════════');
    
    // Check if updated_at exists
    const hasUpdatedAt = result.rows.some(col => col.column_name === 'updated_at');
    if (!hasUpdatedAt) {
      console.log('\n⚠️  WARNING: updated_at column is missing!');
      console.log('This column is expected by the TimeEntry model.');
    } else {
      console.log('\n✅ updated_at column exists');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
