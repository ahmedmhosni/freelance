const db = require('./src/db');

(async () => {
  try {
    const pool = await db;
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'projects' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Projects table schema:');
    console.log(JSON.stringify(result.recordset, null, 2));
    
    // Also check if there are any constraints
    const constraints = await pool.request().query(`
      SELECT 
        CONSTRAINT_NAME,
        CONSTRAINT_TYPE
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'projects'
    `);
    
    console.log('\nConstraints:');
    console.log(JSON.stringify(constraints.recordset, null, 2));
    
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
})();
