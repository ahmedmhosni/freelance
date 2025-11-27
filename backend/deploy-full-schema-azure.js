const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Azure PostgreSQL connection
const config = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool(config);

async function deploySchema() {
  try {
    console.log('🐘 Connecting to Azure PostgreSQL...');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}\n`);
    
    const client = await pool.connect();
    console.log('✓ Connected successfully\n');
    
    // Read the full schema
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Deploying complete schema...\n');
    
    // Split by statements and execute
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        successCount++;
        
        // Log table creations
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
          if (match) {
            console.log(`✓ Table: ${match[1]}`);
          }
        }
      } catch (error) {
        if (error.message.includes('already exists')) {
          skipCount++;
        } else {
          console.log(`⚠️  Warning: ${error.message.split('\n')[0]}`);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✓ Executed: ${successCount} statements`);
    console.log(`   ⊘ Skipped: ${skipCount} (already exist)`);
    
    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n✓ Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });
    
    client.release();
    console.log('\n✅ Schema deployment complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

deploySchema();
