/**
 * Create Admin User in Production Database
 * Creates an admin user with specified credentials
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Production database configuration (Azure)
const productionConfig = {
  host: process.env.DB_HOST || 'roastifydbpost.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'roastifydb',
  user: process.env.DB_USER || 'adminuser',
  password: process.env.DB_PASSWORD || 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
};

async function createAdminUser() {
  console.log('👑 Creating Admin User');
  console.log('====================');
  
  const pool = new Pool(productionConfig);
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to production database');
    
    // Admin user details
    const adminEmail = 'ahmedmhosni90@gmail.com';
    const adminPassword = 'Ahmed#123456';
    const adminName = 'Ahmed Hosni';
    
    console.log(`\n👤 Creating admin user: ${adminEmail}`);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    console.log('🔐 Password hashed successfully');
    
    // Insert or update admin user
    const insertAdminSQL = `
      INSERT INTO users (
        name, 
        email, 
        password, 
        email_verified, 
        role, 
        created_at, 
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        email_verified = EXCLUDED.email_verified,
        role = EXCLUDED.role,
        updated_at = NOW()
      RETURNING id, name, email, role, email_verified, created_at
    `;
    
    const result = await pool.query(insertAdminSQL, [
      adminName,
      adminEmail,
      hashedPassword,
      true, // Email verified
      'admin' // Admin role
    ]);
    
    const adminUser = result.rows[0];
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('================================');
    console.log(`👤 ID: ${adminUser.id}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👑 Name: ${adminUser.name}`);
    console.log(`🔑 Role: ${adminUser.role}`);
    console.log(`✅ Verified: ${adminUser.email_verified}`);
    console.log(`📅 Created: ${adminUser.created_at}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    // Test login credentials
    console.log('\n🧪 Testing admin login...');
    
    const loginTest = await testAdminLogin(adminEmail, adminPassword);
    
    if (loginTest.success) {
      console.log('✅ Admin login test successful!');
      console.log(`🎫 Token received: ${loginTest.token ? 'YES' : 'NO'}`);
      console.log(`👑 Admin role confirmed: ${loginTest.user?.role === 'admin' ? 'YES' : 'NO'}`);
    } else {
      console.log('❌ Admin login test failed:', loginTest.error);
    }
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔚 Database connection closed');
  }
}

async function testAdminLogin(email, password) {
  const https = require('https');
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'api.roastify.online',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve({
              success: true,
              token: response.token,
              user: response.user
            });
          } else {
            resolve({
              success: false,
              error: `HTTP ${res.statusCode}: ${data}`
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: `Parse error: ${error.message}`
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });

    req.write(postData);
    req.end();
  });
}

// Run the script
createAdminUser().catch(console.error);