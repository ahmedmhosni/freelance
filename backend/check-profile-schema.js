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

// Expected schema
const expectedFields = {
  // Core fields
  id: { type: 'int', nullable: false },
  name: { type: 'nvarchar', length: 255, nullable: false },
  email: { type: 'nvarchar', length: 255, nullable: false },
  password: { type: 'nvarchar', length: 255, nullable: false },
  role: { type: 'nvarchar', length: 50, nullable: true },
  is_active: { type: 'bit', nullable: true },
  created_at: { type: 'datetime2', nullable: true },
  
  // Profile fields
  username: { type: 'nvarchar', length: 50, nullable: true },
  job_title: { type: 'nvarchar', length: 100, nullable: true },
  bio: { type: 'nvarchar', length: 500, nullable: true },
  profile_picture: { type: 'nvarchar', length: 500, nullable: true },
  location: { type: 'nvarchar', length: 100, nullable: true },
  website: { type: 'nvarchar', length: 255, nullable: true },
  
  // Social media
  linkedin: { type: 'nvarchar', length: 255, nullable: true },
  behance: { type: 'nvarchar', length: 255, nullable: true },
  instagram: { type: 'nvarchar', length: 255, nullable: true },
  facebook: { type: 'nvarchar', length: 255, nullable: true },
  twitter: { type: 'nvarchar', length: 255, nullable: true },
  github: { type: 'nvarchar', length: 255, nullable: true },
  dribbble: { type: 'nvarchar', length: 255, nullable: true },
  portfolio: { type: 'nvarchar', length: 255, nullable: true },
  
  // Settings
  profile_visibility: { type: 'nvarchar', length: 20, nullable: true }
};

async function checkSchema() {
  try {
    const pool = await sql.connect(config);
    
    const query = `
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH, 
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `;
    
    const result = await pool.request().query(query);
    const actualFields = {};
    
    result.recordset.forEach(col => {
      actualFields[col.COLUMN_NAME] = {
        type: col.DATA_TYPE,
        length: col.CHARACTER_MAXIMUM_LENGTH,
        nullable: col.IS_NULLABLE === 'YES',
        default: col.COLUMN_DEFAULT
      };
    });
    
    console.log('\n📊 Schema Validation Report\n');
    console.log('='.repeat(80));
    
    let allGood = true;
    let missingFields = [];
    let wrongType = [];
    let wrongLength = [];
    
    // Check expected fields
    for (const [fieldName, expected] of Object.entries(expectedFields)) {
      const actual = actualFields[fieldName];
      
      if (!actual) {
        missingFields.push(fieldName);
        allGood = false;
        continue;
      }
      
      // Check type
      if (actual.type !== expected.type) {
        wrongType.push({
          field: fieldName,
          expected: expected.type,
          actual: actual.type
        });
        allGood = false;
      }
      
      // Check length for varchar/nvarchar
      if (expected.length && actual.length !== expected.length) {
        wrongLength.push({
          field: fieldName,
          expected: expected.length,
          actual: actual.length
        });
        allGood = false;
      }
      
      // Check nullable
      if (actual.nullable !== expected.nullable) {
        console.log(`⚠️  ${fieldName}: nullable mismatch (expected: ${expected.nullable}, actual: ${actual.nullable})`);
      }
    }
    
    // Report results
    if (allGood) {
      console.log('✅ All fields are correct!\n');
    } else {
      if (missingFields.length > 0) {
        console.log('\n❌ Missing Fields:');
        missingFields.forEach(f => console.log(`   - ${f}`));
      }
      
      if (wrongType.length > 0) {
        console.log('\n❌ Wrong Data Types:');
        wrongType.forEach(w => {
          console.log(`   - ${w.field}: expected ${w.expected}, got ${w.actual}`);
        });
      }
      
      if (wrongLength.length > 0) {
        console.log('\n⚠️  Wrong Lengths:');
        wrongLength.forEach(w => {
          console.log(`   - ${w.field}: expected ${w.expected}, got ${w.actual}`);
        });
      }
    }
    
    // Check for extra fields
    const extraFields = Object.keys(actualFields).filter(f => !expectedFields[f]);
    if (extraFields.length > 0) {
      console.log('\n📝 Extra Fields (not in expected schema):');
      extraFields.forEach(f => {
        const field = actualFields[f];
        const length = field.length ? `(${field.length})` : '';
        console.log(`   - ${f}: ${field.type}${length}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total fields: ${Object.keys(actualFields).length}`);
    console.log(`✅ Expected fields: ${Object.keys(expectedFields).length}`);
    console.log(`${allGood ? '✅' : '❌'} Schema validation: ${allGood ? 'PASSED' : 'FAILED'}\n`);
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();
