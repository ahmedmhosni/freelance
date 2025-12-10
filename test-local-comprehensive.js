const http = require('http');
const { Pool } = require('pg');

console.log('\n' + '='.repeat(100));
console.log('🔧 COMPREHENSIVE LOCAL TESTING & FIXING');
console.log('='.repeat(100));
console.log(`Time: ${new Date().toISOString()}`);
console.log('='.repeat(100) + '\n');

const LOCAL_API_URL = 'http://localhost:5000';

// Local database connection
const localDbPool = new Pool({
  host: 'localhost',
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123',
  port: 5432,
  ssl: false
});

// Azure database connection for comparison
const azureDbPool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = `${LOCAL_API_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Local-Test-Script',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
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

async function checkLocalServer() {
  console.log('🔍 CHECKING LOCAL SERVER STATUS');
  console.log('-'.repeat(80));
  
  try {
    const result = await makeRequest('/health');
    if (result.status === 200) {
      console.log('✅ Local server is running');
      return true;
    } else {
      console.log(`❌ Local server returned status ${result.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Local server is not running');
    console.log('   Please start the backend server with: npm run dev');
    return false;
  }
}

async function syncDatabaseContent() {
  console.log('\n📊 SYNCING DATABASE CONTENT FROM AZURE TO LOCAL');
  console.log('-'.repeat(80));
  
  try {
    // Test both connections
    await localDbPool.query('SELECT NOW()');
    await azureDbPool.query('SELECT NOW()');
    console.log('✅ Both database connections successful');

    // Sync announcements
    console.log('\n📢 Syncing announcements...');
    const azureAnnouncements = await azureDbPool.query('SELECT * FROM announcements ORDER BY id');
    
    if (azureAnnouncements.rows.length > 0) {
      // Clear local announcements
      await localDbPool.query('DELETE FROM announcements');
      
      // Insert Azure announcements
      for (const announcement of azureAnnouncements.rows) {
        await localDbPool.query(`
          INSERT INTO announcements (id, title, content, is_featured, media_url, media_type, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            is_featured = EXCLUDED.is_featured,
            media_url = EXCLUDED.media_url,
            media_type = EXCLUDED.media_type,
            updated_at = EXCLUDED.updated_at
        `, [
          announcement.id,
          announcement.title,
          announcement.content,
          announcement.is_featured,
          announcement.media_url,
          announcement.media_type,
          announcement.created_at,
          announcement.updated_at
        ]);
      }
      console.log(`✅ Synced ${azureAnnouncements.rows.length} announcements`);
    }

    // Sync quotes
    console.log('\n💬 Syncing quotes...');
    const azureQuotes = await azureDbPool.query('SELECT * FROM quotes ORDER BY id');
    
    if (azureQuotes.rows.length > 0) {
      // Clear local quotes
      await localDbPool.query('DELETE FROM quotes');
      
      // Insert Azure quotes
      for (const quote of azureQuotes.rows) {
        await localDbPool.query(`
          INSERT INTO quotes (id, text, author, category, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            text = EXCLUDED.text,
            author = EXCLUDED.author,
            category = EXCLUDED.category,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at
        `, [
          quote.id,
          quote.text,
          quote.author,
          quote.category,
          quote.is_active,
          quote.created_at,
          quote.updated_at
        ]);
      }
      console.log(`✅ Synced ${azureQuotes.rows.length} quotes`);
    }

    // Sync versions and changelog
    console.log('\n📝 Syncing versions and changelog...');
    const azureVersions = await azureDbPool.query('SELECT * FROM versions ORDER BY id');
    
    if (azureVersions.rows.length > 0) {
      // Clear local versions
      await localDbPool.query('DELETE FROM changelog_items');
      await localDbPool.query('DELETE FROM versions');
      
      // Insert Azure versions
      for (const version of azureVersions.rows) {
        await localDbPool.query(`
          INSERT INTO versions (id, version, release_date, is_published, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            version = EXCLUDED.version,
            release_date = EXCLUDED.release_date,
            is_published = EXCLUDED.is_published,
            updated_at = EXCLUDED.updated_at
        `, [
          version.id,
          version.version,
          version.release_date,
          version.is_published,
          version.created_by,
          version.created_at,
          version.updated_at
        ]);
      }

      // Sync changelog items
      const azureChangelogItems = await azureDbPool.query('SELECT * FROM changelog_items ORDER BY id');
      for (const item of azureChangelogItems.rows) {
        await localDbPool.query(`
          INSERT INTO changelog_items (id, version_id, category, title, description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            category = EXCLUDED.category,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            updated_at = EXCLUDED.updated_at
        `, [
          item.id,
          item.version_id,
          item.category,
          item.title,
          item.description,
          item.created_at,
          item.updated_at
        ]);
      }
      
      console.log(`✅ Synced ${azureVersions.rows.length} versions and ${azureChangelogItems.rows.length} changelog items`);
    }

    // Sync legal content
    console.log('\n⚖️ Syncing legal content...');
    const azureLegal = await azureDbPool.query('SELECT * FROM legal_content ORDER BY id');
    
    if (azureLegal.rows.length > 0) {
      // Clear local legal content
      await localDbPool.query('DELETE FROM legal_content');
      
      // Insert Azure legal content
      for (const legal of azureLegal.rows) {
        await localDbPool.query(`
          INSERT INTO legal_content (id, type, content, is_active, updated_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            content = EXCLUDED.content,
            is_active = EXCLUDED.is_active,
            updated_by = EXCLUDED.updated_by,
            updated_at = EXCLUDED.updated_at
        `, [
          legal.id,
          legal.type,
          legal.content,
          legal.is_active,
          legal.updated_by,
          legal.created_at,
          legal.updated_at
        ]);
      }
      console.log(`✅ Synced ${azureLegal.rows.length} legal content items`);
    }

    console.log('\n✅ Database sync completed successfully!');
    return true;

  } catch (error) {
    console.log(`❌ Database sync failed: ${error.message}`);
    return false;
  }
}

async function testAllLocalAPIs() {
  console.log('\n🔍 TESTING ALL LOCAL APIs');
  console.log('-'.repeat(80));

  const tests = [
    // Public APIs (no auth required)
    { name: 'Health Check', path: '/health', expected: 'ok' },
    { name: 'Announcements', path: '/api/announcements', expected: 'array', expectedCount: 6 },
    { name: 'Featured Announcements', path: '/api/announcements/featured', expected: 'array', expectedCount: 3 },
    { name: 'Daily Quote', path: '/api/quotes/daily', expected: 'quote' },
    { name: 'Public Changelog', path: '/api/changelog/public', expected: 'versions', expectedCount: 2 },
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
    total: tests.length,
    issues: []
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
        results.issues.push(`${test.name}: Server error (${result.status})`);
      } else if (result.status === 500) {
        console.log(`   ❌ INTERNAL ERROR: Code issue or database query failed`);
        results.broken++;
        results.issues.push(`${test.name}: Internal server error`);
      } else if (result.status === 401 && test.expected === '401_ok') {
        console.log(`   ✅ AUTH REQUIRED: Correctly requires authentication`);
        results.authRequired++;
      } else if (result.status === 200) {
        if (test.expected === 'array' && Array.isArray(result.data)) {
          console.log(`   ✅ SUCCESS: ${result.data.length} items returned`);
          
          if (test.expectedCount && result.data.length !== test.expectedCount) {
            console.log(`   ⚠️ COUNT MISMATCH: Expected ${test.expectedCount}, got ${result.data.length}`);
            results.issues.push(`${test.name}: Expected ${test.expectedCount} items, got ${result.data.length}`);
          }
          
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
          // Check if it's the exact fallback quote (not just containing the text)
          const fallbackQuote = 'Success is not final, failure is not fatal: it is the courage to continue that counts.';
          const isDatabase = result.data.text !== fallbackQuote;
          console.log(`   ${isDatabase ? '✅' : '⚠️'} QUOTE: ${isDatabase ? 'Database' : 'Fallback'}`);
          console.log(`   📋 "${result.data.text.substring(0, 50)}..." - ${result.data.author}`);
          
          if (!isDatabase) {
            results.issues.push(`${test.name}: Using fallback quote instead of database`);
          }
          
          results.working++;
        } else if (test.expected === 'versions' && result.data.versions) {
          console.log(`   ✅ SUCCESS: ${result.data.versions.length} versions`);
          
          if (test.expectedCount && result.data.versions.length !== test.expectedCount) {
            console.log(`   ⚠️ COUNT MISMATCH: Expected ${test.expectedCount}, got ${result.data.versions.length}`);
            results.issues.push(`${test.name}: Expected ${test.expectedCount} versions, got ${result.data.versions.length}`);
          }
          
          results.working++;
        } else if (test.expected === 'content' && result.data.content) {
          console.log(`   ✅ SUCCESS: Content length ${result.data.content.length} chars`);
          results.working++;
        } else if (test.expected === 'ok') {
          console.log(`   ✅ SUCCESS: Health check passed`);
          results.working++;
        } else {
          console.log(`   ⚠️ UNEXPECTED: Got data but not expected format`);
          results.issues.push(`${test.name}: Unexpected response format`);
          results.working++;
        }
      } else {
        console.log(`   ❌ UNEXPECTED STATUS: ${result.status}`);
        results.broken++;
        results.issues.push(`${test.name}: Unexpected status ${result.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ REQUEST FAILED: ${error.message}`);
      results.broken++;
      results.issues.push(`${test.name}: Request failed - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

async function testAuthenticatedAPIs() {
  console.log('\n🔐 TESTING AUTHENTICATED APIs');
  console.log('-'.repeat(80));

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
        { name: 'Tasks List', path: '/api/tasks' },
        { name: 'Invoices List', path: '/api/invoices' },
        { name: 'Time Tracking', path: '/api/time-tracking' },
        { name: 'Reports', path: '/api/reports' },
      ];

      let authResults = { working: 0, broken: 0, total: authTests.length };

      for (const test of authTests) {
        try {
          const result = await makeRequest(test.path, 'GET', null, {
            'Authorization': `Bearer ${token}`
          });
          
          console.log(`${test.name}: Status ${result.status}`);
          if (result.status === 200) {
            console.log(`   ✅ Working`);
            authResults.working++;
          } else {
            console.log(`   ⚠️ Status ${result.status}`);
            authResults.broken++;
          }
        } catch (error) {
          console.log(`${test.name}: ❌ Failed - ${error.message}`);
          authResults.broken++;
        }
      }

      return authResults;
    } else {
      console.log('⚠️ Login failed - authenticated endpoints cannot be tested');
      console.log(`   Status: ${loginResult.status}`);
      if (loginResult.data && loginResult.data.error) {
        console.log(`   Error: ${loginResult.data.error}`);
      }
      return { working: 0, broken: 0, total: 0 };
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    return { working: 0, broken: 0, total: 0 };
  }
}

async function generateLocalReport(apiResults, authResults) {
  console.log('\n' + '='.repeat(100));
  console.log('📊 LOCAL TESTING REPORT');
  console.log('='.repeat(100));

  console.log('\n🌐 PUBLIC API STATUS:');
  console.log(`✅ Working APIs: ${apiResults.working}/${apiResults.total}`);
  console.log(`❌ Broken APIs: ${apiResults.broken}/${apiResults.total}`);
  console.log(`🔐 Auth Required: ${apiResults.authRequired}/${apiResults.total}`);
  console.log(`📊 Success Rate: ${Math.round((apiResults.working + apiResults.authRequired) / apiResults.total * 100)}%`);

  if (authResults.total > 0) {
    console.log('\n🔐 AUTHENTICATED API STATUS:');
    console.log(`✅ Working APIs: ${authResults.working}/${authResults.total}`);
    console.log(`❌ Broken APIs: ${authResults.broken}/${authResults.total}`);
    console.log(`📊 Success Rate: ${Math.round(authResults.working / authResults.total * 100)}%`);
  }

  if (apiResults.issues.length > 0) {
    console.log('\n⚠️ ISSUES FOUND:');
    apiResults.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  console.log('\n🎯 NEXT STEPS:');
  if (apiResults.broken > 0 || apiResults.issues.length > 0) {
    console.log('❌ Issues found in local testing:');
    console.log('1. Fix the identified issues');
    console.log('2. Re-run this test script');
    console.log('3. Once all tests pass, push to production');
  } else {
    console.log('✅ All local tests passed!');
    console.log('Ready to push to production with:');
    console.log('   git add .');
    console.log('   git commit -m "Fix: Database connection and API issues"');
    console.log('   git push origin main');
  }

  console.log('\n' + '='.repeat(100) + '\n');
}

async function main() {
  try {
    // Step 1: Check if local server is running
    const serverRunning = await checkLocalServer();
    if (!serverRunning) {
      console.log('\n❌ Please start the local server first:');
      console.log('   cd backend && npm run dev');
      return;
    }

    // Step 2: Sync database content from Azure to local
    const syncSuccess = await syncDatabaseContent();
    if (!syncSuccess) {
      console.log('\n⚠️ Database sync failed, but continuing with tests...');
    }

    // Step 3: Test all public APIs
    const apiResults = await testAllLocalAPIs();

    // Step 4: Test authenticated APIs
    const authResults = await testAuthenticatedAPIs();

    // Step 5: Generate report
    await generateLocalReport(apiResults, authResults);

  } catch (error) {
    console.error('\n❌ Local testing failed:', error);
  } finally {
    // Close database connections
    await localDbPool.end();
    await azureDbPool.end();
  }
}

// Run the comprehensive local test
main();