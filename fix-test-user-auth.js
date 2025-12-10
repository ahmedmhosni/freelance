const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

console.log('\n' + '='.repeat(80));
console.log('🔧 FIXING TEST USER AUTHENTICATION');
console.log('='.repeat(80));
console.log(`Time: ${new Date().toISOString()}`);
console.log('='.repeat(80) + '\n');

// Local database connection
const localDbPool = new Pool({
  host: 'localhost',
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123',
  port: 5432,
  ssl: false
});

async function fixTestUser() {
  try {
    console.log('👤 FIXING TEST USER WITH PROPER BCRYPT HASH');
    console.log('-'.repeat(50));
    
    const password = 'Ahmed@123456';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('Generated bcrypt hash for password');
    
    // Check if user exists
    const existingUser = await localDbPool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );
    
    if (existingUser.rows.length === 0) {
      // Create user
      await localDbPool.query(`
        INSERT INTO users (name, email, password, role, is_verified, email_verified, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        'Ahmed Hosni',
        'ahmedmhosni90@gmail.com',
        hashedPassword,
        'admin',
        true,
        true,
        true,
        new Date(),
        new Date()
      ]);
      console.log('✅ Created test user with bcrypt hash');
    } else {
      // Update existing user
      await localDbPool.query(`
        UPDATE users 
        SET password = $1, is_verified = true, email_verified = true, is_active = true, role = 'admin'
        WHERE email = $2
      `, [hashedPassword, 'ahmedmhosni90@gmail.com']);
      console.log('✅ Updated existing test user with bcrypt hash');
    }
    
    // Verify user
    const user = await localDbPool.query(
      'SELECT id, name, email, role, is_verified, email_verified, is_active FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );
    
    if (user.rows.length > 0) {
      const userData = user.rows[0];
      console.log(`✅ User verified:`);
      console.log(`   Name: ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Verified: ${userData.is_verified}`);
      console.log(`   Email Verified: ${userData.email_verified}`);
      console.log(`   Active: ${userData.is_active}`);
    }
    
    // Test password verification
    console.log('\n🔍 TESTING PASSWORD VERIFICATION');
    console.log('-'.repeat(50));
    
    const storedUser = await localDbPool.query(
      'SELECT password FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );
    
    if (storedUser.rows.length > 0) {
      const isValid = await bcrypt.compare(password, storedUser.rows[0].password);
      console.log(`Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }

  } catch (error) {
    console.log(`❌ Error fixing test user: ${error.message}`);
  }
}

async function testLogin() {
  console.log('\n🔍 TESTING LOGIN API');
  console.log('-'.repeat(50));
  
  const http = require('http');
  
  const loginData = JSON.stringify({
    email: 'ahmedmhosni90@gmail.com',
    password: 'Ahmed@123456'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log(`Login Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Login successful!');
          console.log(`   User: ${parsed.user.name}`);
          console.log(`   Role: ${parsed.user.role}`);
          console.log(`   Token: ${parsed.token.substring(0, 20)}...`);
        } else {
          console.log('❌ Login failed');
          console.log(`   Error: ${parsed.error || parsed.message}`);
        }
      } catch (e) {
        console.log(`❌ Login returned invalid JSON: ${data}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log(`❌ Login request failed: ${error.message}`);
  });
  
  req.write(loginData);
  req.end();
}

async function main() {
  try {
    await localDbPool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');
    
    await fixTestUser();
    
    // Wait a bit then test login
    setTimeout(async () => {
      await testLogin();
      
      setTimeout(() => {
        console.log('\n' + '='.repeat(80));
        console.log('🔧 TEST USER FIX COMPLETED');
        console.log('='.repeat(80) + '\n');
        process.exit(0);
      }, 2000);
    }, 1000);

  } catch (error) {
    console.error('\n❌ Fix process failed:', error);
    process.exit(1);
  }
}

// Run the fix
main();