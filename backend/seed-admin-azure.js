const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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
console.log('Seeding Admin User to Azure PostgreSQL');
console.log('========================================\n');

const pool = new Pool(config);

async function seedAdmin() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to Azure PostgreSQL\n');
    
    // Admin user details
    const name = 'Ahmed Hosni';
    const email = 'ahmedmhosni90@gmail.com';
    const password = 'Ahmed#123456';
    const role = 'admin';
    
    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('✓ Password hashed\n');
    
    // Check if user already exists
    const checkResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('⚠ User already exists!');
      console.log('User ID:', checkResult.rows[0].id);
      console.log('Email:', checkResult.rows[0].email);
      console.log('\nUpdating password, role, and verifying email...');
      
      // Update existing user with new password
      await client.query(
        `UPDATE users 
         SET password = $1,
             role = $2, 
             email_verified = true,
             email_verification_token = NULL,
             email_verification_code = NULL,
             email_verification_expires = NULL
         WHERE email = $3`,
        [passwordHash, role, email]
      );
      
      console.log('✓ User updated with new password, admin role, and verified\n');
    } else {
      console.log('Creating new admin user...');
      
      // Insert new user
      const result = await client.query(
        `INSERT INTO users (
          name, 
          email, 
          password, 
          role, 
          email_verified,
          is_active,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id, name, email, role`,
        [name, email, passwordHash, role, true, true]
      );
      
      const user = result.rows[0];
      console.log('✓ Admin user created successfully!\n');
      console.log('User Details:');
      console.log('  ID:', user.id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
    }
    
    console.log('\n========================================');
    console.log('Admin User Ready!');
    console.log('========================================');
    console.log('Login Credentials:');
    console.log('  Email: ahmedmhosni90@gmail.com');
    console.log('  Password: Ahmed#123456');
    console.log('  Role: admin');
    console.log('========================================');
    console.log('\nYou can now login at: https://roastify.online/login');
    console.log('========================================');
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

seedAdmin();
