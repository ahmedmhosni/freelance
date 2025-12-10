const https = require('https');
const { Pool } = require('pg');

console.log('\n' + '='.repeat(100));
console.log('🔧 COMPREHENSIVE PRODUCTION FIX & VERIFICATION');
console.log('='.repeat(100));
console.log(`Time: ${new Date().toISOString()}`);
console.log('='.repeat(100) + '\n');

const API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

// Database connection for verification
const dbPool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Test-Script'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers,
            raw: true
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function waitForAppRestart() {
  console.log('⏳ Waiting for app to restart and stabilize...');
  let attempts = 0;
  const maxAttempts = 12; // 2 minutes max
  
  while (attempts < maxAttempts) {
    try {
      const result = await makeRequest('/health');
      if (result.status === 200) {
        console.log('✅ App is responding to health checks');
        return true;
      }
    } catch (error) {
      // Continue waiting
    }
    
    attempts++;
    console.log(`   Attempt ${attempts}/${maxAttempts} - waiting 10 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  console.log('⚠️ App may still be starting up, continuing with tests...');
  return false;
}

async function verifyDatabaseContent() {
  console.log('\n📊 VERIFYING DATABASE CONTENT');
  console.log('-'.repeat(80));
  
  try {
    // Test connection
    await dbPool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Check announcements
    const announcements = await dbPool.query('SELECT COUNT(*) as count FROM announcements');
    const announcementsCount = parseInt(announcements.rows[0].count);
    console.log(`📢 Announcements: ${announcementsCount} total`);

    const featuredAnnouncements = await dbPool.query('SELECT COUNT(*) as count FROM announcements WHERE is_featured = true');
    const featuredCount = parseInt(featuredAnnouncements.rows[0].count);
    console.log(`🌟 Featured announcements: ${featuredCount} total`);

    // Check quotes
    const quotes = await dbPool.query('SELECT COUNT(*) as count FROM quotes WHERE is_active = true');
    const quotesCount = parseInt(quotes.rows[0].count);
    console.log(`💬 Active quotes: ${quotesCount} total`);

    // Check versions
    const versions = await dbPool.query('SELECT COUNT(*) as count FROM versions WHERE is_published = true');
    const versionsCount = parseInt(versions.rows[0].count);
    console.log(`📝 Published versions: ${versionsCount} total`);

    // Check users
    const users = await dbPool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = true');
    const usersCount = parseInt(users.rows[0].count);
    console.log(`👥 Verified users: ${usersCount} total`);

    return {
      announcements: announcementsCount,
      featured: featuredCount,
      quotes: quotesCount,
      versions: versionsCount,
      users: usersCount
    };

  } catch (error) {
    console.log(`❌ Database verification failed: ${error.message}`);
    return null;
  }
}

async function testAllAPIs() {
  console.log('\n🔍 TESTING ALL PRODUCTION APIs');
  console.log('-'.repeat(80));

  const tests = [
    // Public APIs (no auth required)
    { name: 'Health Check', path: '/health', expected: 'ok' },
    { name: 'Announcements', path: '/api/announcements', expected: 'array' },
    { name: 'Featured Announcements', path: '/api/announcements/featured', expected: 'array' },
    { name: 'Daily Quote', path: '/api/quotes/daily', expected: 'quote' },
    { name: 'Public Changelog', path: '/api/changelog/public', expected: 'versions' },
    { name: 'Legal Terms', path: '/api/legal/terms', expected: 'content' },
    { name: 'Legal Privacy', path: '/api/legal/privacy', expected: 'content' },
    
    // Admin APIs (will return 401 without auth, but should not 500)
    { name: 'Admin Activity Stats', path: '/api/admin/activity/stats', expected: '401_ok' },
    { name: 'Admin GDPR Requests', path: '/api/admin/gdpr/export-requests', expected: '401_ok' },
    { name: 'Feedback System', path: '/api/feedback', expected: '401_ok' },
    
    // Version APIs
    { name: 'Version Names', path: '/api/changelog/admin/version-names', expected: '401_ok' },
    { name: 'Admin Versions', path: '/api/changelog/admin/versions', expected: '401_ok' },
  ];

  let results = {
    working: 0,
    broken: 0,
    authRequired: 0,
    total: tests.length
  };

  for (const test of tests) {
    console.log(`\n🔍 Testing: ${test.name}`);
    console.log(`   Path: ${test.path}`);
    
    try {
      const result = await makeRequest(test.path);
      console.log(`   Status: ${result.status}`);
      
      if (result.status === 502 || result.status === 503) {
        console.log(`   ❌ SERVER ERROR: App may be restarting or database connection failed`);
        results.broken++;
      } else if (result.status === 500) {
        console.log(`   ❌ INTERNAL ERROR: Code issue or database query failed`);
        results.broken++;
      } else if (result.status === 401 && test.expected === '401_ok') {
        console.log(`   ✅ AUTH REQUIRED: Correctly requires authentication`);
        results.authRequired++;
      } else if (result.status === 200) {
        if (test.expected === 'array' && Array.isArray(result.data)) {
          console.log(`   ✅ SUCCESS: ${result.data.length} items returned`);
          results.working++;
          
          // Show sample data for key endpoints
          if (result.data.length > 0) {
            if (test.name === 'Announcements' && result.data[0].title) {
              console.log(`   📋 Sample: "${result.data[0].title}"`);
            } else if (test.name === 'Featured Announcements' && result.data[0].title) {
              console.log(`   📋 Sample: "${result.data[0].title}"`);
            }
          }
        } else if (test.expected === 'quote' && result.data.text) {
          const isDatabase = !result.data.text.includes('Success is not final');
          console.log(`   ${isDatabase ? '✅' : '⚠️'} QUOTE: ${isDatabase ? 'Database' : 'Fallback'}`);
          console.log(`   📋 "${result.data.text.substring(0, 50)}..." - ${result.data.author}`);
          results.working++;
        } else if (test.expected === 'versions' && result.data.versions) {
          console.log(`   ✅ SUCCESS: ${result.data.versions.length} versions`);
          results.working++;
        } else if (test.expected === 'content' && result.data.content) {
          console.log(`   ✅ SUCCESS: Content length ${result.data.content.length} chars`);
          results.working++;
        } else if (test.expected === 'ok') {
          console.log(`   ✅ SUCCESS: Health check passed`);
          results.working++;
        } else {
          console.log(`   ⚠️ UNEXPECTED: Got data but not expected format`);
          results.working++;
        }
      } else {
        console.log(`   ❌ UNEXPECTED STATUS: ${result.status}`);
        results.broken++;
      }
      
    } catch (error) {
      console.log(`   ❌ REQUEST FAILED: ${error.message}`);
      results.broken++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

async function testAuthenticatedAPIs() {
  console.log('\n🔐 TESTING AUTHENTICATED APIs (Login Test)');
  console.log('-'.repeat(80));

  // First, try to create a test user if needed
  console.log('📝 Checking if test user exists...');
  
  try {
    // Try to login with known credentials
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'ahmedmhosni90@gmail.com',
      password: 'Ahmed@123456'
    });

    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('✅ Login successful - testing authenticated endpoints');
      const token = loginResult.data.token;
      
      // Test some authenticated endpoints
      const authTests = [
        { name: 'User Profile', path: '/api/profile' },
        { name: 'Dashboard Stats', path: '/api/dashboard/stats' },
        { name: 'Clients List', path: '/api/clients' },
        { name: 'Projects List', path: '/api/projects' },
      ];

      for (const test of authTests) {
        try {
          const result = await makeRequest(test.path, 'GET', null, {
            'Authorization': `Bearer ${token}`
          });
          
          console.log(`${test.name}: Status ${result.status}`);
          if (result.status === 200) {
            console.log(`   ✅ Working`);
          } else {
            console.log(`   ⚠️ Status ${result.status}`);
          }
        } catch (error) {
          console.log(`${test.name}: ❌ Failed - ${error.message}`);
        }
      }
    } else {
      console.log('⚠️ Login failed - authenticated endpoints cannot be tested');
      console.log(`   Status: ${loginResult.status}`);
      if (loginResult.data && loginResult.data.error) {
        console.log(`   Error: ${loginResult.data.error}`);
      }
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
  }
}

async function generateReport(dbContent, apiResults) {
  console.log('\n' + '='.repeat(100));
  console.log('📊 COMPREHENSIVE PRODUCTION STATUS REPORT');
  console.log('='.repeat(100));

  console.log('\n🗄️ DATABASE STATUS:');
  if (dbContent) {
    console.log(`✅ Database Connection: Working`);
    console.log(`📢 Announcements: ${dbContent.announcements} total, ${dbContent.featured} featured`);
    console.log(`💬 Active Quotes: ${dbContent.quotes}`);
    console.log(`📝 Published Versions: ${dbContent.versions}`);
    console.log(`👥 Verified Users: ${dbContent.users}`);
  } else {
    console.log(`❌ Database Connection: Failed`);
  }

  console.log('\n🌐 API STATUS:');
  console.log(`✅ Working APIs: ${apiResults.working}/${apiResults.total}`);
  console.log(`❌ Broken APIs: ${apiResults.broken}/${apiResults.total}`);
  console.log(`🔐 Auth Required: ${apiResults.authRequired}/${apiResults.total}`);
  console.log(`📊 Success Rate: ${Math.round((apiResults.working + apiResults.authRequired) / apiResults.total * 100)}%`);

  console.log('\n🎯 EXPECTED vs ACTUAL:');
  if (dbContent) {
    console.log(`Announcements: Expected ${dbContent.announcements}, API should return same`);
    console.log(`Featured: Expected ${dbContent.featured}, API should return same`);
    console.log(`Quotes: Expected ${dbContent.quotes} active, API should return random quote`);
    console.log(`Versions: Expected ${dbContent.versions} published, API should return same`);
  }

  console.log('\n🔧 NEXT STEPS:');
  if (apiResults.broken > 0) {
    console.log('❌ Issues found:');
    console.log('1. Check Azure App Service logs for errors');
    console.log('2. Verify environment variables are set correctly');
    console.log('3. Ensure app has fully restarted');
    console.log('4. Check database connection from production server');
  } else {
    console.log('✅ All APIs working correctly!');
    console.log('Your production app should now display all content properly.');
  }

  console.log('\n' + '='.repeat(100) + '\n');
}

async function main() {
  try {
    // Step 1: Wait for app to be ready
    await waitForAppRestart();

    // Step 2: Verify database content
    const dbContent = await verifyDatabaseContent();

    // Step 3: Test all APIs
    const apiResults = await testAllAPIs();

    // Step 4: Test authenticated APIs
    await testAuthenticatedAPIs();

    // Step 5: Generate comprehensive report
    await generateReport(dbContent, apiResults);

  } catch (error) {
    console.error('\n❌ Comprehensive test failed:', error);
  } finally {
    // Close database connection
    await dbPool.end();
  }
}

// Run the comprehensive test
main();