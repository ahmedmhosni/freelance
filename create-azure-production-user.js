const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Azure Production Database Configuration
const azureConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: {
    rejectUnauthorized: false
  }
};

async function createProductionUser() {
  const client = new Client(azureConfig);

  try {
    console.log('Connecting to Azure production database...');
    await client.connect();
    console.log('✓ Connected to Azure database\n');

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('✗ Users table does not exist!');
      console.log('You need to run migrations on Azure first.');
      return;
    }

    console.log('✓ Users table exists\n');

    // Create a test user with hashed password
    const password = 'Test1234';
    const hashedPassword = await bcrypt.hash(password, 12);

    const email = 'admin@roastify.com';
    const name = 'Admin User';

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log(`User ${email} already exists`);
      console.log('User details:', {
        id: existingUser.rows[0].id,
        name: existingUser.rows[0].name,
        email: existingUser.rows[0].email,
        role: existingUser.rows[0].role,
        email_verified: existingUser.rows[0].email_verified
      });

      // Update password and verify email
      await client.query(
        'UPDATE users SET password = $1, email_verified = true WHERE email = $2',
        [hashedPassword, email]
      );
      console.log('\n✓ Updated password and verified email');
    } else {
      // Create new user
      const result = await client.query(`
        INSERT INTO users (name, email, password, role, email_verified, created_at)
        VALUES ($1, $2, $3, $4, true, NOW())
        RETURNING id, name, email, role, email_verified
      `, [name, email, hashedPassword, 'admin']);

      console.log('✓ Created new user:', result.rows[0]);
    }

    console.log('\n=== Login Credentials ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('========================\n');

    // Test the credentials
    console.log('Testing login credentials...');
    const user = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length > 0) {
      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (validPassword && user.rows[0].email_verified) {
        console.log('✓ Credentials are valid and email is verified');
      } else if (!validPassword) {
        console.log('✗ Password does not match');
      } else if (!user.rows[0].email_verified) {
        console.log('✗ Email is not verified');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

createProductionUser();
