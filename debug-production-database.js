const https = require('https');

// Test the database connection by calling a simple endpoint that logs database info
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Script'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function debugProductionDatabase() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 DEBUGGING PRODUCTION DATABASE CONNECTION');
  console.log('='.repeat(80));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80) + '\n');

  // Test different endpoints to see which ones work
  const tests = [
    {
      name: 'Health Check',
      path: '/health',
      description: 'Basic server health'
    },
    {
      name: 'API Version',
      path: '/api/version',
      description: 'API version info'
    },
    {
      name: 'Legal Terms',
      path: '/api/legal/terms',
      description: 'Should return terms from legal_content table'
    },
    {
      name: 'Legal Privacy',
      path: '/api/legal/privacy',
      description: 'Should return privacy from legal_content table'
    },
    {
      name: 'All Announcements',
      path: '/api/announcements',
      description: 'Should return 6 announcements from announcements table'
    },
    {
      name: 'Featured Announcements',
      path: '/api/announcements/featured',
      description: 'Should return 3 featured announcements'
    },
    {
      name: 'Daily Quote',
      path: '/api/quotes/daily',
      description: 'Should return random quote from quotes table'
    },
    {
      name: 'Public Changelog',
      path: '/api/changelog/public',
      description: 'Should return 2 published versions'
    }
  ];

  let workingEndpoints = 0;
  let brokenEndpoints = 0;

  for (const test of tests) {
    console.log(`🔍 Testing: ${test.name}`);
    console.log(`   Path: ${test.path}`);
    console.log(`   Expected: ${test.description}`);
    
    try {
      const result = await makeRequest(test.path);
      console.log(`   Status: ${result.status}`);
      
      if (result.status === 200) {
        workingEndpoints++;
        
        if (typeof result.data === 'object') {
          if (Array.isArray(result.data)) {
            console.log(`   ✅ Response: Array with ${result.data.length} items`);
            
            if (test.path.includes('announcements') && result.data.length === 0) {
              console.log(`   🔴 PROBLEM: Should have data but got empty array!`);
              brokenEndpoints++;
            } else if (test.path.includes('changelog') && result.data.versions && result.data.versions.length === 0) {
              console.log(`   🔴 PROBLEM: Should have versions but got empty array!`);
              brokenEndpoints++;
            }
          } else {
            // Single object
            if (result.data.content) {
              console.log(`   ✅ Response: Content with ${result.data.content.length} characters`);
            } else if (result.data.text) {
              console.log(`   ✅ Response: Quote - "${result.data.text.substring(0, 50)}..."`);
            } else if (result.data.versions !== undefined) {
              console.log(`   ✅ Response: ${result.data.versions.length} versions`);
            } else {
              console.log(`   ✅ Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
            }
          }
        } else {
          console.log(`   ✅ Response: ${result.data.substring(0, 100)}...`);
        }
      } else {
        brokenEndpoints++;
        console.log(`   ❌ Error: Status ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data)}`);
      }
      
    } catch (error) {
      brokenEndpoints++;
      console.log(`   ❌ Request Failed: ${error.message}`);
    }
    
    console.log();
  }

  console.log('='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Working Endpoints: ${workingEndpoints}`);
  console.log(`Broken Endpoints: ${brokenEndpoints}`);
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Success Rate: ${Math.round(workingEndpoints/tests.length*100)}%`);

  console.log('\n💡 DIAGNOSIS:');
  if (brokenEndpoints === 0) {
    console.log('✅ All endpoints working correctly');
  } else {
    console.log('🔴 Some endpoints are not returning expected data');
    console.log('   This suggests:');
    console.log('   1. Database connection issues in production');
    console.log('   2. Environment variables not set correctly');
    console.log('   3. Query errors being caught and returning fallbacks');
    console.log('   4. Different database being used than expected');
  }

  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Check Azure App Service environment variables');
  console.log('2. Verify database connection string in production');
  console.log('3. Check server logs for database errors');
  console.log('4. Test direct database connection from production server');

  console.log('\n' + '='.repeat(80) + '\n');
}

debugProductionDatabase().catch(console.error);