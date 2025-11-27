const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  const pool = new Pool({
    host: process.env.PG_HOST || 'roastifydbpost.postgres.database.azure.com',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'roastifydb',
    user: process.env.PG_USER || 'adminuser',
    password: process.env.PG_PASSWORD || 'AHmed#123456',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🐘 Connecting to Azure PostgreSQL...');
    console.log(`   Host: ${pool.options.host}`);
    console.log(`   Database: ${pool.options.database}`);
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Connected successfully\n');

    console.log('📝 Applying maintenance_content table migration...\n');

    // Drop old maintenance table if exists
    await pool.query('DROP TABLE IF EXISTS maintenance CASCADE');
    console.log('✓ Dropped old maintenance table');

    // Create maintenance_content table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL DEFAULT 'Brilliant ideas take time to be roasted',
        subtitle VARCHAR(500) NOT NULL DEFAULT 'Roastify is coming soon',
        message TEXT NOT NULL DEFAULT 'We are crafting something extraordinary. Great things take time, and we are roasting the perfect experience for you.',
        launch_date DATE,
        is_active BOOLEAN DEFAULT FALSE,
        updated_by INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Created maintenance_content table');

    // Insert default content
    await pool.query(`
      INSERT INTO maintenance_content (title, subtitle, message, is_active, updated_at)
      VALUES (
        'Brilliant ideas take time to be roasted',
        'Roastify is coming soon',
        'We are crafting something extraordinary. Great things take time, and we are roasting the perfect experience for you.',
        FALSE,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Inserted default maintenance content');

    // Create trigger
    await pool.query(`
      CREATE TRIGGER update_maintenance_content_updated_at
        BEFORE UPDATE ON maintenance_content
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✓ Created trigger');

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
    if (error.message.includes('already exists')) {
      console.log('\n✓ Table already exists, skipping...');
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
    console.log('\n🔌 Connection closed');
  }
}

applyMigration();
