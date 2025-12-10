const { Pool } = require('pg');
const { getOne } = require('./backend/src/db/postgresql');

console.log('\n' + '='.repeat(80));
console.log('🔍 DEBUGGING QUOTES ISSUE');
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

async function debugQuotes() {
  try {
    console.log('🔍 CHECKING QUOTES IN DATABASE');
    console.log('-'.repeat(50));
    
    // Check all quotes
    const allQuotes = await localDbPool.query('SELECT * FROM quotes ORDER BY id');
    console.log(`Total quotes in database: ${allQuotes.rows.length}`);
    
    if (allQuotes.rows.length > 0) {
      console.log('\nAll quotes:');
      allQuotes.rows.forEach((quote, index) => {
        console.log(`${index + 1}. ID: ${quote.id}`);
        console.log(`   Text: "${quote.text}"`);
        console.log(`   Author: ${quote.author}`);
        console.log(`   Category: ${quote.category}`);
        console.log(`   Active: ${quote.is_active}`);
        console.log();
      });
    }
    
    // Check active quotes
    const activeQuotes = await localDbPool.query('SELECT * FROM quotes WHERE is_active = true ORDER BY id');
    console.log(`Active quotes: ${activeQuotes.rows.length}`);
    
    if (activeQuotes.rows.length > 0) {
      console.log('\nActive quotes:');
      activeQuotes.rows.forEach((quote, index) => {
        console.log(`${index + 1}. "${quote.text}" - ${quote.author}`);
      });
    }
    
    // Test the exact query used in the API
    console.log('\n🔍 TESTING API QUERY');
    console.log('-'.repeat(50));
    
    const apiQuery = 'SELECT * FROM quotes WHERE is_active = true ORDER BY RANDOM() LIMIT 1';
    console.log(`Query: ${apiQuery}`);
    
    const result = await localDbPool.query(apiQuery);
    console.log(`Result rows: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      const quote = result.rows[0];
      console.log('✅ Query returned a quote:');
      console.log(`   Text: "${quote.text}"`);
      console.log(`   Author: ${quote.author}`);
      console.log(`   Category: ${quote.category}`);
    } else {
      console.log('❌ Query returned no results');
    }
    
    // Test using the getOne function
    console.log('\n🔍 TESTING getOne FUNCTION');
    console.log('-'.repeat(50));
    
    try {
      const quote = await getOne(apiQuery);
      if (quote) {
        console.log('✅ getOne returned a quote:');
        console.log(`   Text: "${quote.text}"`);
        console.log(`   Author: ${quote.author}`);
        console.log(`   Category: ${quote.category}`);
      } else {
        console.log('❌ getOne returned null');
      }
    } catch (error) {
      console.log(`❌ getOne failed: ${error.message}`);
    }
    
    // Test the API endpoint directly
    console.log('\n🔍 TESTING API ENDPOINT');
    console.log('-'.repeat(50));
    
    const http = require('http');
    
    const req = http.get('http://localhost:5000/api/quotes/daily', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`API Status: ${res.statusCode}`);
          console.log(`API Response: "${parsed.text}" - ${parsed.author}`);
          
          const isDatabase = !parsed.text.includes('Success is not final');
          console.log(`Source: ${isDatabase ? 'Database' : 'Fallback'}`);
          
          if (!isDatabase) {
            console.log('❌ API is still using fallback quote');
          } else {
            console.log('✅ API is using database quote');
          }
        } catch (e) {
          console.log(`❌ API returned invalid JSON: ${data}`);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ API request failed: ${error.message}`);
    });

  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`);
  }
}

async function main() {
  try {
    await localDbPool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');
    
    await debugQuotes();
    
    // Wait a bit for the HTTP request to complete
    setTimeout(() => {
      console.log('\n' + '='.repeat(80));
      console.log('🔍 DEBUG COMPLETED');
      console.log('='.repeat(80) + '\n');
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('\n❌ Debug process failed:', error);
    process.exit(1);
  }
}

// Run the debug
main();