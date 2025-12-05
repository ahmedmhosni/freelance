// Database Migration Script using Node.js
const fs = require('fs');
const { Client } = require('pg');

// Database configuration from Azure
const config = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: false
  }
};

async function runMigration() {
  console.log('=========================================');
  console.log('  Safe Database Migration');
  console.log('=========================================');
  console.log('');
  console.log(`Database: ${config.database}`);
  console.log(`Host: ${config.host}`);
  console.log('');

  // Check if password is provided
  if (!config.password) {
    console.error('ERROR: Database password not provided!');
    console.log('');
    console.log('Set DB_PASSWORD environment variable:');
    console.log('  $env:DB_PASSWORD="your-password"; node run-migration.js');
    console.log('');
    process.exit(1);
  }

  const client = new Client(config);

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected successfully');
    console.log('');

    // Read migration file
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync('database/safe-migration.sql', 'utf8');
    console.log('✓ Migration file loaded');
    console.log('');

    // Run migration
    console.log('Running migration...');
    console.log('This may take a minute...');
    console.log('');
    
    await client.query(migrationSQL);
    
    console.log('✓ Migration executed successfully');
    console.log('');

    // Verify tables
    console.log('Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`✓ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log('');

    // Check user count
    const userCountResult = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.rows[0].count;
    console.log(`✓ Total users: ${userCount}`);
    console.log('');

    console.log('=========================================');
    console.log('  Migration Completed Successfully!');
    console.log('=========================================');
    console.log('');
    console.log('All tables have been created/updated.');
    console.log('Existing users and data have been preserved.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('=========================================');
    console.error('  Migration Failed!');
    console.error('=========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('password authentication failed')) {
      console.error('Check your database password!');
    } else if (error.message.includes('connection')) {
      console.error('Check your database connection settings!');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
