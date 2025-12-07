const { Client } = require('pg');

const azureConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
};

async function fixAzureSchema() {
  const client = new Client(azureConfig);

  try {
    await client.connect();
    console.log('✓ Connected to Azure database\n');

    console.log('=== CHECKING ALL TABLES ===\n');

    // Get all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`Found ${tables.rows.length} tables:\n`);
    
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      // Get columns for this table
      const columns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`📋 ${tableName} (${columns.rows.length} columns)`);
      
      // Get row count
      try {
        const count = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log(`   Rows: ${count.rows[0].count}`);
      } catch (e) {
        console.log(`   Rows: Error - ${e.message}`);
      }
    }

    console.log('\n\n=== CHECKING FOR MISSING COLUMNS ===\n');

    // Check users table for missing columns
    console.log('Checking users table...');
    const usersCols = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);
    
    const usersColNames = usersCols.rows.map(r => r.column_name);
    const requiredUsersCols = [
      'last_login_at',
      'last_activity_at',
      'login_count'
    ];

    const missingUsersCols = requiredUsersCols.filter(c => !usersColNames.includes(c));
    
    if (missingUsersCols.length > 0) {
      console.log('\n❌ Missing columns in users table:');
      missingUsersCols.forEach(col => console.log(`  - ${col}`));
      
      console.log('\n🔧 Adding missing columns...');
      
      for (const col of missingUsersCols) {
        try {
          if (col === 'last_login_at' || col === 'last_activity_at') {
            await client.query(`
              ALTER TABLE users 
              ADD COLUMN IF NOT EXISTS ${col} TIMESTAMP;
            `);
            console.log(`  ✓ Added ${col}`);
          } else if (col === 'login_count') {
            await client.query(`
              ALTER TABLE users 
              ADD COLUMN IF NOT EXISTS ${col} INTEGER DEFAULT 0;
            `);
            console.log(`  ✓ Added ${col}`);
          }
        } catch (error) {
          console.log(`  ✗ Failed to add ${col}: ${error.message}`);
        }
      }
    } else {
      console.log('✓ All required columns exist in users table');
    }

    // Check time_entries table
    console.log('\n\nChecking time_entries table...');
    const timeEntriesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'time_entries'
      );
    `);

    if (timeEntriesCheck.rows[0].exists) {
      const timeEntriesCols = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'time_entries';
      `);
      
      const timeEntriesColNames = timeEntriesCols.rows.map(r => r.column_name);
      const requiredTimeEntriesCols = ['updated_at'];
      
      const missingTimeEntriesCols = requiredTimeEntriesCols.filter(c => !timeEntriesColNames.includes(c));
      
      if (missingTimeEntriesCols.length > 0) {
        console.log('❌ Missing columns in time_entries table:');
        missingTimeEntriesCols.forEach(col => console.log(`  - ${col}`));
        
        console.log('\n🔧 Adding missing columns...');
        await client.query(`
          ALTER TABLE time_entries 
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
        console.log('  ✓ Added updated_at');
      } else {
        console.log('✓ All required columns exist in time_entries table');
      }
    } else {
      console.log('⚠ time_entries table does not exist');
    }

    // Check tasks table
    console.log('\n\nChecking tasks table...');
    const tasksCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tasks'
      );
    `);

    if (tasksCheck.rows[0].exists) {
      const tasksCols = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'tasks';
      `);
      
      const tasksColNames = tasksCols.rows.map(r => r.column_name);
      
      // Check for camelCase vs snake_case issues
      if (tasksColNames.includes('userid') && !tasksColNames.includes('user_id')) {
        console.log('⚠ Found camelCase column "userid", should be "user_id"');
      }
      if (tasksColNames.includes('projectid') && !tasksColNames.includes('project_id')) {
        console.log('⚠ Found camelCase column "projectid", should be "project_id"');
      }
    }

    console.log('\n\n=== VERIFICATION ===\n');
    
    // Verify users table again
    const verifyUsers = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('last_login_at', 'last_activity_at', 'login_count')
      ORDER BY column_name;
    `);
    
    console.log('Users table columns:');
    verifyUsers.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });

    await client.end();
    console.log('\n✓ Schema fix complete');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    try {
      await client.end();
    } catch (e) {}
  }
}

fixAzureSchema();
