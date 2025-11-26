const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'roastify_local',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔐 Creating Admin User...\n');

    const email = 'ahmedmhosni90@gmail.com';
    const password = 'Ahmed#123456';
    const name = 'Ahmed Hosni';

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists!');
      console.log(`   Email: ${email}`);
      console.log(`   ID: ${existingUser.rows[0].id}`);
      console.log(`   Role: ${existingUser.rows[0].role}`);
      console.log('\nUpdating to admin role...');
      
      await pool.query(
        'UPDATE users SET role = $1, email_verified = $2 WHERE email = $3',
        ['admin', true, email]
      );
      
      console.log('✅ User updated to admin role\n');
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed\n');

    // Insert admin user
    console.log('📝 Inserting admin user...');
    const result = await pool.query(`
      INSERT INTO users (
        name, 
        email, 
        password, 
        role, 
        email_verified,
        is_active,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name, email, role, email_verified
    `, [name, email, hashedPassword, 'admin', true, true]);

    const user = result.rows[0];

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('ADMIN USER DETAILS');
    console.log('═══════════════════════════════════════');
    console.log(`ID:              ${user.id}`);
    console.log(`Name:            ${user.name}`);
    console.log(`Email:           ${user.email}`);
    console.log(`Password:        Ahmed#123456`);
    console.log(`Role:            ${user.role}`);
    console.log(`Email Verified:  ${user.email_verified}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 You can now login with these credentials!\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
