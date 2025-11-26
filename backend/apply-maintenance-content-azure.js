const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  const pool = new Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('🐘 Connecting to Azure PostgreSQL...');
    console.log(`   Host: ${process.env.PG_HOST}`);
    console.log(`   Database: ${process.env.PG_DATABASE}`);
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Connected successfully\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'ADD_MAINTENANCE_CONTENT_POSTGRES.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Applying maintenance_content table migration...\n');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const result = await pool.query(statement);
          if (result.rows && result.rows.length > 0) {
            console.log('Result:', result.rows);
          }
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            console.error('Error executing statement:', err.message);
          }
        }
      }
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📊 Verifying maintenance_content table...');
    
    const checkTable = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'maintenance_content'
      ORDER BY ordinal_position
    `);

    if (checkTable.rows.length > 0) {
      console.log('\n✓ Table structure:');
      checkTable.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });

      // Check if default content exists
      const contentCheck = await pool.query('SELECT * FROM maintenance_content LIMIT 1');
      console.log(`\n✓ Default content: ${contentCheck.rows.length > 0 ? 'EXISTS' : 'MISSING'}`);
      if (contentCheck.rows.length > 0) {
        console.log('  Title:', contentCheck.rows[0].title);
        console.log('  Is Active:', contentCheck.rows[0].is_active);
      }
    } else {
      console.log('❌ Table not found!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Connection closed');
  }
}

applyMigration();
