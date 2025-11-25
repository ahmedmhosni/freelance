require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'FreelancerDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  }
};

if (!config.user || !config.password) {
  config.authentication = { type: 'default' };
  delete config.user;
  delete config.password;
}

const fieldsToAdd = [
  { name: 'username', type: 'NVARCHAR(50)', unique: true },
  { name: 'job_title', type: 'NVARCHAR(100)' },
  { name: 'bio', type: 'NVARCHAR(500)' },
  { name: 'profile_picture', type: 'NVARCHAR(500)' },
  { name: 'location', type: 'NVARCHAR(100)' },
  { name: 'website', type: 'NVARCHAR(255)' },
  { name: 'linkedin', type: 'NVARCHAR(255)' },
  { name: 'profile_visibility', type: 'NVARCHAR(20)', default: "'public'" }
];

async function addFields() {
  try {
    console.log('🚀 Adding missing profile fields...\n');
    const pool = await sql.connect(config);
    
    for (const field of fieldsToAdd) {
      try {
        // Check if column exists
        const checkQuery = `
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'users' AND COLUMN_NAME = '${field.name}'
        `;
        const check = await pool.request().query(checkQuery);
        
        if (check.recordset[0].count === 0) {
          // Add column
          const defaultClause = field.default ? ` DEFAULT ${field.default}` : '';
          const addQuery = `ALTER TABLE users ADD ${field.name} ${field.type}${defaultClause}`;
          await pool.request().query(addQuery);
          console.log(`✅ Added: ${field.name}`);
          
          // Add unique constraint if needed
          if (field.unique) {
            try {
              await pool.request().query(`
                ALTER TABLE users ADD CONSTRAINT UQ_users_${field.name} UNIQUE (${field.name})
              `);
              console.log(`   ✓ Added unique constraint on ${field.name}`);
            } catch (err) {
              console.log(`   ⚠️  Unique constraint already exists on ${field.name}`);
            }
          }
        } else {
          console.log(`⏭️  Skipped: ${field.name} (already exists)`);
        }
      } catch (err) {
        console.log(`❌ Error adding ${field.name}: ${err.message}`);
      }
    }
    
    // Add index on username
    try {
      await pool.request().query(`
        CREATE NONCLUSTERED INDEX idx_users_username ON users(username) WHERE username IS NOT NULL
      `);
      console.log(`✅ Added index on username`);
    } catch (err) {
      console.log(`⏭️  Index on username already exists`);
    }
    
    await pool.close();
    
    console.log('\n✅ Done! Run verify-profile-fields.js to check.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addFields();
