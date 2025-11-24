const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.azure') });
const sql = require('mssql');

console.log('Environment check:');
console.log('Server:', process.env.AZURE_SQL_SERVER);
console.log('Database:', process.env.AZURE_SQL_DATABASE);
console.log('User:', process.env.AZURE_SQL_USER);

const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

if (!config.server || !config.database || !config.user || !config.password) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure .env.azure file exists with:');
  console.error('- AZURE_SQL_SERVER');
  console.error('- AZURE_SQL_DATABASE');
  console.error('- AZURE_SQL_USER');
  console.error('- AZURE_SQL_PASSWORD');
  process.exit(1);
}

const quotes = [
  ['Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill'],
  ['The only way to do great work is to love what you do.', 'Steve Jobs'],
  ['Productivity is never an accident. It is always the result of a commitment to excellence.', 'Paul J. Meyer'],
  ['Focus on being productive instead of busy.', 'Tim Ferriss'],
  ['The key is not to prioritize what\'s on your schedule, but to schedule your priorities.', 'Stephen Covey'],
  ['Don\'t watch the clock; do what it does. Keep going.', 'Sam Levenson'],
  ['The way to get started is to quit talking and begin doing.', 'Walt Disney'],
  ['Your time is limited, don\'t waste it living someone else\'s life.', 'Steve Jobs'],
  ['The future depends on what you do today.', 'Mahatma Gandhi'],
  ['Quality is not an act, it is a habit.', 'Aristotle']
];

async function addQuotes() {
  try {
    console.log('Connecting to Azure SQL Database...');
    const pool = await sql.connect(config);
    console.log('✓ Connected successfully');

    // Check if quotes table exists
    console.log('\nChecking if quotes table exists...');
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'quotes'
    `);

    if (tableCheck.recordset[0].count === 0) {
      console.log('Creating quotes table...');
      await pool.request().query(`
        CREATE TABLE quotes (
          id INT IDENTITY(1,1) PRIMARY KEY,
          text NVARCHAR(MAX) NOT NULL,
          author NVARCHAR(255),
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE()
        )
      `);
      console.log('✓ Quotes table created');
    } else {
      console.log('✓ Quotes table already exists');
    }

    // Check if quotes already exist
    console.log('\nChecking existing quotes...');
    const countResult = await pool.request().query('SELECT COUNT(*) as count FROM quotes');
    const existingCount = countResult.recordset[0].count;
    console.log(`Found ${existingCount} existing quotes`);

    if (existingCount === 0) {
      console.log('\nInserting default quotes...');
      for (const [text, author] of quotes) {
        const request = pool.request();
        request.input('text', sql.NVarChar, text);
        request.input('author', sql.NVarChar, author);
        await request.query(`
          INSERT INTO quotes (text, author, is_active) 
          VALUES (@text, @author, 1)
        `);
        console.log(`✓ Added quote by ${author}`);
      }
      console.log(`\n✓ Successfully added ${quotes.length} quotes`);
    } else {
      console.log('✓ Quotes already exist, skipping insertion');
    }

    // Verify quotes
    console.log('\nVerifying quotes...');
    const verifyResult = await pool.request().query('SELECT COUNT(*) as count FROM quotes WHERE is_active = 1');
    console.log(`✓ Total active quotes: ${verifyResult.recordset[0].count}`);

    await pool.close();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addQuotes();
