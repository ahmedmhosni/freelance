/**
 * Setup Test Database
 * Creates the database schema for testing
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Connect to postgres database first
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'admin'
  });

  try {
    console.log('Connecting to PostgreSQL...');
    
    // Check if roastify database exists
    const dbCheck = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'roastify'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('Creating roastify database...');
      await pool.query('CREATE DATABASE roastify');
      console.log('✓ Database created');
    } else {
      console.log('✓ Database already exists');
    }

    await pool.end();

    // Now connect to roastify database and run schema
    const roastifyPool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      database: 'roastify',
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || 'admin'
    });

    console.log('Running schema...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove comments and split by semicolons properly
    const statements = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await roastifyPool.query(statement);
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE\s+(\w+)/i);
          if (match) {
            console.log(`  ✓ Created table: ${match[1]}`);
          }
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          console.error(`  ✗ Error in statement ${i + 1}:`, error.message);
          console.error(`  Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log('✓ Schema applied successfully');

    // Verify tables exist
    const tables = await roastifyPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n✓ Tables created:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await roastifyPool.end();
    console.log('\n✓ Database setup complete!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
