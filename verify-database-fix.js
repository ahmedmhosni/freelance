const https = require('https');

const API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${path}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    }).on('error', reject);
  });
}

async function verifyDatabaseFix() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VERIFYING DATABASE CONNECTION FIX');
  console.log('='.repeat(80));
  console.log(`API URL: ${API_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80) + '\n');

  const tests = [
    {
      name: 'Announcements',
      path: '/api/announcements',
      expected: 6,
      type: 'array'
    },
    {
      name: 'Featured Announcements',
      path: '/api/announcements/featured',
      expected: 3,
      type: 'array'
    },
    {
      name: 'Daily Quote',
      path: '/api/quotes/daily',
      expected: 'database quote',
      type: 'quote'
    },
    {
      name: 'Public Changelog',
      path: '/api/changelog/public',
      expected: 2,
      type: 'versions'
    }
  ];

  let fixed = 0;
  let stillBroken = 0;

  for (const test of tests) {
    console.log(`🔍 Testing: ${test.name}`);
    console.log(`   Path: ${test.path}`);
    
    try {
      const result = await makeRequest(test.path);
      console.log(`   Status: ${result.status}`);
      
      if (result.status === 200) {
        let success = false;
        
        if (test.type === 'array') {
          const count = Array.isArray(result.data) ? result.data.length : 0;
          console.log(`   Response: ${count} items`);
          
          if (count === test.expected) {
            console.log(`   ✅ FIXED! Got expected ${test.expected} items`);
            success = true;
            fixed++;
            
            // Show sample data
            if (count > 0 && result.data[0].title) {
              console.log(`   Sample: "${result.data[0].title}"`);
            }
          } else if (count === 0) {
            console.log(`   ❌ STILL BROKEN: Expected ${test.expected} items, got 0`);
            stillBroken++;
          } else {
            console.log(`   ⚠️ PARTIAL: Expected ${test.expected} items, got ${count}`);
            fixed++;
          }
        } else if (test.type === 'quote') {
          if (result.data.text && result.data.author) {
            const isDatabase = !result.data.text.includes('Success is not final, failure is not fatal');
            console.log(`   Quote: "${result.data.text.substring(0, 50)}..."`);
            console.log(`   Author: ${result.data.author}`);
            
            if (isDatabase) {
              console.log(`   ✅ FIXED! Getting database quote (not fallback)`);
              success = true;
              fixed++;
            } else {
              console.log(`   ⚠️ STILL FALLBACK: Getting fallback quote, not database`);
              stillBroken++;
            }
          }
        } else if (test.type === 'versions') {
          const count = result.data.versions ? result.data.versions.length : 0;
          console.log(`   Response: ${count} versions`);
          
          if (count === test.expected) {
            console.log(`   ✅ FIXED! Got expected ${test.expected} versions`);
            success = true;
            fixed++;
          } else if (count === 0) {
            console.log(`   ❌ STILL BROKEN: Expected ${test.expected} versions, got 0`);
            stillBroken++;
          } else {
            console.log(`   ⚠️ PARTIAL: Expected ${test.expected} versions, got ${count}`);
            fixed++;
          }
        }
      } else {
        console.log(`   ❌ ERROR: Status ${result.status}`);
        stillBroken++;
      }
      
    } catch (error) {
      console.log(`   ❌ REQUEST FAILED: ${error.message}`);
      stillBroken++;
    }
    
    console.log();
  }

  console.log('='.repeat(80));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(80));
  console.log(`✅ Fixed: ${fixed}/${tests.length}`);
  console.log(`❌ Still Broken: ${stillBroken}/${tests.length}`);
  console.log(`Success Rate: ${Math.round(fixed/tests.length*100)}%`);

  if (fixed === tests.length) {
    console.log('\n🎉 SUCCESS! All database connections are now working!');
    console.log('Your app should now display:');
    console.log('• 6 announcements on the home page');
    console.log('• 3 featured announcements in the banner');
    console.log('• Random quotes from your database');
    console.log('• 2 published versions in the changelog');
  } else if (fixed > 0) {
    console.log('\n⚠️ PARTIAL SUCCESS: Some endpoints are now working');
    console.log('If some are still broken, wait 1-2 minutes for the app to fully restart');
    console.log('and run this script again.');
  } else {
    console.log('\n❌ NO IMPROVEMENT: Database connection still not working');
    console.log('Double-check that you added the correct environment variables:');
    console.log('• DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT');
    console.log('• Make sure you clicked "Save" in Azure');
    console.log('• Wait for the app to restart (30-60 seconds)');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

console.log('\n🔧 Run this script AFTER adding the DB_* environment variables to Azure');
console.log('This will verify that the database connection is now working correctly.\n');

verifyDatabaseFix().catch(console.error);