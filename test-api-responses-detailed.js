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
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    }).on('error', reject);
  });
}

async function testAPIResponses() {
  console.log('\n' + '='.repeat(80));
  console.log('🌐 TESTING ACTUAL API RESPONSES');
  console.log('='.repeat(80));
  console.log(`API URL: ${API_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80) + '\n');

  const endpoints = [
    {
      name: 'All Announcements',
      path: '/api/announcements',
      expected: '6 announcements from database'
    },
    {
      name: 'Featured Announcements',
      path: '/api/announcements/featured',
      expected: '3 featured announcements from database'
    },
    {
      name: 'Daily Quote',
      path: '/api/quotes/daily',
      expected: 'Random quote from 3 active quotes'
    },
    {
      name: 'Public Changelog',
      path: '/api/changelog/public',
      expected: '2 published versions with changelog items'
    },
    {
      name: 'Current Version',
      path: '/api/changelog/current-version',
      expected: 'Latest version info'
    },
    {
      name: 'Legal Terms',
      path: '/api/legal/terms',
      expected: 'Active terms content (7294 characters)'
    },
    {
      name: 'Legal Privacy',
      path: '/api/legal/privacy',
      expected: 'Active privacy content (7849 characters)'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`🔍 Testing: ${endpoint.name}`);
    console.log(`   GET ${endpoint.path}`);
    console.log(`   Expected: ${endpoint.expected}`);
    
    try {
      const result = await makeRequest(endpoint.path);
      console.log(`   Status: ${result.status}`);
      
      if (result.status === 200) {
        if (typeof result.data === 'object') {
          if (Array.isArray(result.data)) {
            console.log(`   Response: Array with ${result.data.length} items`);
            if (result.data.length > 0) {
              console.log(`   ✅ SUCCESS: Got ${result.data.length} items`);
              // Show first item details
              const first = result.data[0];
              if (first.title) console.log(`      First item: "${first.title}"`);
              if (first.text) console.log(`      Quote: "${first.text}" - ${first.author}`);
              if (first.version) console.log(`      Version: ${first.version}`);
            } else {
              console.log(`   ⚠️ EMPTY: Array is empty (should have data!)`);
            }
          } else {
            // Single object response
            if (result.data.text && result.data.author) {
              console.log(`   ✅ SUCCESS: Quote - "${result.data.text}" by ${result.data.author}`);
            } else if (result.data.content) {
              const contentLength = result.data.content.length;
              console.log(`   ✅ SUCCESS: Content with ${contentLength} characters`);
            } else if (result.data.versions) {
              console.log(`   ✅ SUCCESS: ${result.data.versions.length} versions`);
            } else {
              console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
            }
          }
        } else {
          console.log(`   Response: ${result.data.substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ ERROR: Status ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ REQUEST FAILED: ${error.message}`);
    }
    
    console.log();
  }

  console.log('='.repeat(80));
  console.log('💡 ANALYSIS SUMMARY');
  console.log('='.repeat(80));
  console.log('\nBased on the database content, these endpoints should return:');
  console.log('• /api/announcements → 6 announcements');
  console.log('• /api/announcements/featured → 3 featured announcements');
  console.log('• /api/quotes/daily → 1 random quote from 3 active quotes');
  console.log('• /api/changelog/public → 2 published versions');
  console.log('• /api/legal/terms → 7294 character terms content');
  console.log('• /api/legal/privacy → 7849 character privacy content');
  console.log('\nIf any endpoint returns empty arrays or fallback content,');
  console.log('there\'s a disconnect between the database and the API routes.');
  console.log('\n' + '='.repeat(80) + '\n');
}

testAPIResponses().catch(console.error);