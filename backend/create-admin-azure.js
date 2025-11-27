const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user for Azure production...\n');
    
    // Check if admin exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@roastify.com'"
    );
    
    if (existing.rows.length > 0) {
      console.log('✓ Admin user already exists');
      console.log(`   Email: ${existing.rows[0].email}`);
      console.log(`   Name: ${existing.rows[0].name}`);
      console.log(`   Role: ${existing.rows[0].role}`);
      console.log(`   Verified: ${existing.rows[0].email_verified}`);
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    
    const result = await pool.query(`
      INSERT INTO users (
        email, 
        password, 
        name, 
        role, 
        email_verified,
        is_active,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, email, name, role
    `, [
      'admin@roastify.com',
      hashedPassword,
      'System Administrator',
      'admin',
      true,
      true
    ]);
    
    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Name: ${result.rows[0].name}`);
    console.log(`   Role: ${result.rows[0].role}`);
    console.log('\n🔑 Login credentials:');
    console.log('   Email: admin@roastify.com');
    console.log('   Password: Admin@123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
