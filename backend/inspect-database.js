const { Pool } = require('pg');
require('dotenv').config();

async function inspectDatabase() {
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'roastify_local',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DATABASE INSPECTION REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`📊 Total Tables: ${tablesResult.rows.length}\n`);

    // Inspect each table
    for (const { table_name } of tablesResult.rows) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`📋 TABLE: ${table_name.toUpperCase()}`);
      console.log('═══════════════════════════════════════════════════════════\n');

      // Get columns
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table_name]);

      console.log('📝 Columns:');
      columnsResult.rows.forEach(col => {
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   • ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
      });

      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${table_name}`);
      const rowCount = parseInt(countResult.rows[0].count);
      console.log(`\n📊 Row Count: ${rowCount}`);

      // Get sample data if rows exist
      if (rowCount > 0) {
        const dataResult = await pool.query(`SELECT * FROM ${table_name} LIMIT 5`);
        console.log('\n📄 Sample Data (first 5 rows):');
        
        if (dataResult.rows.length > 0) {
          dataResult.rows.forEach((row, index) => {
            console.log(`\n   Row ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
              let displayValue = value;
              if (value === null) {
                displayValue = 'NULL';
              } else if (typeof value === 'string' && value.length > 50) {
                displayValue = value.substring(0, 50) + '...';
              } else if (value instanceof Date) {
                displayValue = value.toISOString();
              } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
              }
              console.log(`      ${key}: ${displayValue}`);
            });
          });
        }
      } else {
        console.log('\n   ⚠️  No data in this table');
      }

      console.log('\n');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const { table_name } of tablesResult.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${table_name}`);
      const count = countResult.rows[0].count;
      const status = count > 0 ? '✅' : '⚪';
      console.log(`${status} ${table_name.padEnd(25)} ${count} rows`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

inspectDatabase();
