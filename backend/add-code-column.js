require('dotenv').config({ path: __dirname + '/.env' });
const sql = require('mssql');

const config = {
  server: 'roastify-db-server.database.windows.net',
  port: 1433,
  database: 'roastifydbazure',
  user: 'adminuser@roastify-db-server',
  password: 'AHmed#123456',
  options: { 
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true 
  }
};

async function addColumn() {
  console.log('📝 Adding verification code column...\n');
  let pool;
  try {
    pool = await sql.connect(config);
    
    try {
      await pool.request().query('ALTER TABLE users ADD email_verification_code NVARCHAR(6)');
      console.log('✅ email_verification_code column added');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Column already exists');
      } else throw err;
    }
    
    try {
      await pool.request().query('CREATE INDEX idx_email_verification_code ON users(email_verification_code)');
      console.log('✅ Index created');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Index already exists');
      } else throw err;
    }
    
    console.log('\n🎉 Done! Verification code support added.\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) await pool.close();
  }
}

addColumn();
