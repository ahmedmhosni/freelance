const { Pool } = require('pg');

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

const pool = new Pool(config);

async function checkUser() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to Azure PostgreSQL\n');
    
    const result = await client.query(
      'SELECT id, name, email, role, email_verified, created_at FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('User found:');
      console.log('  ID:', user.id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Email Verified:', user.email_verified);
      console.log('  Created:', user.created_at);
    } else {
      console.log('User not found!');
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUser();
