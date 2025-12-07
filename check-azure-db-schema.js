const { Client } = require('pg');

const azureDbConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkSchema() {
  const client = new Client(azureDbConfig);

  try {
    await client.connect();
    console.log('Connected to Azure database\n');

    // Get users table schema
    console.log('=== USERS TABLE SCHEMA ===');
    const schemaQuery = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.table(schemaQuery.rows);

    // Check actual user data
    console.log('\n=== SAMPLE USER DATA ===');
    const userData = await client.query(`
      SELECT id, name, email, role, email_verified, created_at, last_login_at
      FROM users
      LIMIT 3;
    `);

    console.table(userData.rows);

    // Check what columns the login query might be using
    console.log('\n=== CHECKING FOR COMMON COLUMN VARIATIONS ===');
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('password', 'password_hash', 'hashed_password', 'user_id', 'userid');
    `);

    console.log('Found columns:', columnCheck.rows.map(r => r.column_name));

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

checkSchema();
