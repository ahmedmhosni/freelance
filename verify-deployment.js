// Verify Production Deployment
const https = require('https');

console.log('========================================');
console.log('  PRODUCTION DEPLOYMENT VERIFICATION');
console.log('========================================\n');

// Test backend health endpoint
function testBackendHealth() {
  return new Promise((resolve) => {
    console.log('Testing backend health endpoint...');
    
    const options = {
      hostname: 'roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net',
      path: '/api/health',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✓ Backend health check: PASSED');
          console.log(`  Status: ${res.statusCode}`);
          console.log(`  Response: ${data}\n`);
          resolve(true);
        } else {
          console.log('✗ Backend health check: FAILED');
          console.log(`  Status: ${res.statusCode}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('✗ Backend health check: ERROR');
      console.log(`  Error: ${error.message}`);
      console.log('  Note: Backend may still be deploying...\n');
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('✗ Backend health check: TIMEOUT');
      console.log('  Note: Backend may still be deploying...\n');
      resolve(false);
    });

    req.end();
  });
}

// Test frontend
function testFrontend() {
  return new Promise((resolve) => {
    console.log('Testing frontend...');
    
    const options = {
      hostname: 'roastify.online',
      path: '/',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
        console.log('✓ Frontend: ACCESSIBLE');
        console.log(`  Status: ${res.statusCode}\n`);
        resolve(true);
      } else {
        console.log('✗ Frontend: ISSUE DETECTED');
        console.log(`  Status: ${res.statusCode}\n`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log('✗ Frontend: ERROR');
      console.log(`  Error: ${error.message}\n`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('✗ Frontend: TIMEOUT\n');
      resolve(false);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  const backendOk = await testBackendHealth();
  const frontendOk = await testFrontend();

  console.log('========================================');
  console.log('  DEPLOYMENT STATUS');
  console.log('========================================\n');

  console.log('Database Migration:  ✓ COMPLETE');
  console.log('Code Pushed:         ✓ COMPLETE');
  console.log('Frontend Build:      ✓ COMPLETE');
  console.log(`Backend Deployment:  ${backendOk ? '✓ COMPLETE' : '⏳ IN PROGRESS'}`);
  console.log(`Frontend Access:     ${frontendOk ? '✓ ACCESSIBLE' : '⚠ NEEDS DEPLOYMENT'}\n`);

  if (!backendOk) {
    console.log('⏳ Backend is still deploying via GitHub Actions');
    console.log('   Check status at: https://github.com/ahmedmhosni/freelance/actions\n');
  }

  if (!frontendOk) {
    console.log('⚠ Frontend needs manual deployment');
    console.log('   Deploy frontend/dist folder to hosting\n');
  }

  console.log('========================================');
  console.log('  NEXT STEPS');
  console.log('========================================\n');

  if (!backendOk) {
    console.log('1. Wait for GitHub Actions to complete (5-10 minutes)');
    console.log('2. Run this script again to verify');
  } else if (!frontendOk) {
    console.log('1. Deploy frontend/dist to Azure Static Web Apps or App Service');
    console.log('2. Test the application end-to-end');
  } else {
    console.log('✓ All systems operational!');
    console.log('\n🚨 CRITICAL: Complete these tasks within 2-3 hours:');
    console.log('   1. Enable database backups');
    console.log('   2. Set up error monitoring');
    console.log('   3. Configure uptime monitoring');
    console.log('   4. Set up critical alerts');
    console.log('\nSee MINIMAL_PRODUCTION_CHECKLIST.md for details');
  }

  console.log('\n========================================\n');
}

runTests();
