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

async function testQuotes() {
  console.log('\n🎯 Testing Quotes Endpoint\n');
  console.log('='.repeat(50));
  
  try {
    const result = await makeRequest('/api/quotes/daily');
    
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 && result.data.text && result.data.author) {
      console.log('\n✅ Quotes endpoint working correctly!');
      console.log(`Quote: "${result.data.text}"`);
      console.log(`Author: ${result.data.author}`);
      console.log(`Category: ${result.data.category}`);
    } else {
      console.log('\n❌ Quotes endpoint has issues');
    }
    
  } catch (error) {
    console.log('\n❌ Error testing quotes:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
}

testQuotes();