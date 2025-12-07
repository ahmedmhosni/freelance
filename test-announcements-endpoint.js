// Test Announcements Endpoint
const https = require('https');

console.log('Testing announcements endpoint...\n');

const options = {
  hostname: 'roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net',
  path: '/api/announcements/featured',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);
    
    if (res.statusCode === 200) {
      console.log('✓ Announcements endpoint working!\n');
      const announcements = JSON.parse(data);
      console.log(`Found ${announcements.length} featured announcements:\n`);
      announcements.forEach((ann, i) => {
        console.log(`${i + 1}. ${ann.title}`);
        console.log(`   Featured: ${ann.is_featured}`);
        console.log(`   Created: ${new Date(ann.created_at).toLocaleDateString()}\n`);
      });
    } else if (res.statusCode === 503) {
      console.log('⏳ Backend is still deploying...');
      console.log('   Try again in a few minutes.\n');
    } else {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
  console.log('   Backend may still be deploying.\n');
});

req.on('timeout', () => {
  req.destroy();
  console.log('⏳ Request timeout - backend may still be deploying.\n');
});

req.end();
