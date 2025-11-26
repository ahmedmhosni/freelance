const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('========================================');
console.log('Deploying Schema to Azure PostgreSQL');
console.log('========================================\n');

const pool = new Pool(config);

async function deploySchema() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to Azure PostgreSQL\n');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...\n');
    
    // Execute schema
    await client.query(schema);
    
    console.log('✓ Schema deployed successfully!\n');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('✓ Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('\n========================================');
    console.log('Schema Deployment Complete!');
    console.log('========================================');
    console.log('Next step: Migrate data from Azure SQL');
    console.log('========================================');
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema deployment failed:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

deploySchema();
