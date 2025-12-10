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

async function checkDeployment() {
  console.log('\n🔍 Checking Production Deployment Status...\n');
  console.log('Time:', new Date().toISOString());
  console.log('─'.repeat(70));

  try {
    // Check health
    const health = await makeRequest('/health');
    console.log(`\n✓ Health: ${health.status === 200 ? '✅ UP' : '❌ DOWN'} (${health.status})`);

    // Check privacy (should be 200 after deployment)
    const privacy = await makeRequest('/api/legal/privacy');
    const privacyStatus = privacy.status === 200 ? '✅ FIXED' : '❌ STILL BROKEN';
    console.log(`✓ Privacy: ${privacyStatus} (${privacy.status})`);
    
    // Check changelog (should be 200 after deployment)
    const changelog = await makeRequest('/api/changelog/public');
    const changelogStatus = changelog.status === 200 ? '✅ FIXED' : '❌ STILL BROKEN';
    console.log(`✓ Changelog: ${changelogStatus} (${changelog.status})`);

    console.log('\n' + '─'.repeat(70));

    if (privacy.status === 200 && changelog.status === 200) {
      console.log('\n🎉 DEPLOYMENT SUCCESSFUL! All endpoints working.\n');
      console.log('Next steps:');
      console.log('1. Add GEMINI_API_KEY to Azure environment variables');
      console.log('2. Enable AI in database');
      console.log('3. Test AI endpoints');
      return true;
    } else {
      console.log('\n⏳ Deployment still in progress or not yet deployed.\n');
      console.log('Wait 2-3 minutes and run this script again.');
      return false;
    }

  } catch (error) {
    console.log('\n❌ Error checking deployment:', error.message);
    console.log('\nServer might be restarting. Wait 1-2 minutes and try again.');
    return false;
  }
}

// Run check every 30 seconds for 5 minutes
let attempts = 0;
const maxAttempts = 10;

async function monitor() {
  attempts++;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Attempt ${attempts}/${maxAttempts}`);
  console.log('='.repeat(70));

  const success = await checkDeployment();
  
  if (success) {
    console.log('\n✅ Monitoring complete - deployment successful!\n');
    process.exit(0);
  } else if (attempts >= maxAttempts) {
    console.log('\n⚠️  Max attempts reached. Deployment may still be in progress.');
    console.log('Check GitHub Actions for deployment status:');
    console.log('https://github.com/ahmedmhosni/freelance/actions\n');
    process.exit(1);
  } else {
    console.log(`\nWaiting 30 seconds before next check...`);
    setTimeout(monitor, 30000);
  }
}

console.log('🚀 Starting Production Deployment Monitor');
console.log('This will check every 30 seconds for up to 5 minutes\n');
console.log('Press Ctrl+C to stop monitoring\n');

monitor();
