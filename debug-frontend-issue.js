const axios = require('axios');

async function debugFrontendIssue() {
    console.log('\n🔍 DEBUGGING FRONTEND DEPLOYMENT ISSUE');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    const frontendUrl = 'https://white-sky-0a7e9f003.4.azurestaticapps.net';
    
    console.log('🌐 Testing frontend URL:', frontendUrl);
    console.log('🔗 GitHub Actions: https://github.com/ahmedmhosni/freelance/actions\n');

    // Test 1: Basic connectivity
    console.log('🔄 Test 1: Basic connectivity...');
    try {
        const response = await axios.get(frontendUrl, {
            timeout: 15000,
            validateStatus: () => true, // Accept any status
            headers: {
                'User-Agent': 'Debug-Tool/1.0'
            }
        });
        
        console.log(`✅ Response Status: ${response.status}`);
        console.log(`📊 Headers:`, Object.keys(response.headers).slice(0, 5).join(', '));
        
        if (response.status === 404) {
            console.log('⚠️ 404 Error - This could mean:');
            console.log('   1. Azure Static Web Apps deployment failed');
            console.log('   2. App is still building/deploying');
            console.log('   3. Configuration issue with Azure Static Web Apps');
        }
        
    } catch (error) {
        console.log(`❌ Connection Error: ${error.message}`);
    }

    // Test 2: Check if Azure Static Web Apps is configured correctly
    console.log('\n🔄 Test 2: Azure Static Web Apps configuration...');
    
    // Try different paths that might exist
    const testPaths = ['/', '/index.html', '/static/', '/.well-known/'];
    
    for (const path of testPaths) {
        try {
            const testUrl = frontendUrl + path;
            const response = await axios.get(testUrl, {
                timeout: 5000,
                validateStatus: () => true
            });
            
            console.log(`   ${path}: ${response.status}`);
            
        } catch (error) {
            console.log(`   ${path}: ERROR (${error.message.substring(0, 30)}...)`);
        }
    }

    // Test 3: Check Azure Static Web Apps API
    console.log('\n🔄 Test 3: Checking deployment status...');
    console.log('📋 Manual checks needed:');
    console.log('   1. Go to GitHub Actions: https://github.com/ahmedmhosni/freelance/actions');
    console.log('   2. Look for "🌐 Deploy Frontend to Azure Static Web Apps" workflow');
    console.log('   3. Check if it\'s running, failed, or completed');
    console.log('   4. If failed, check the logs for errors');

    console.log('\n🔧 POSSIBLE SOLUTIONS:');
    console.log('================================================================================');
    console.log('1. MANUAL TRIGGER:');
    console.log('   - Go to GitHub Actions');
    console.log('   - Click on "🌐 Deploy Frontend to Azure Static Web Apps"');
    console.log('   - Click "Run workflow" → Select "main" → Click "Run workflow"');
    
    console.log('\n2. CHECK AZURE PORTAL:');
    console.log('   - Login to Azure Portal');
    console.log('   - Go to Static Web Apps');
    console.log('   - Check deployment status and logs');
    
    console.log('\n3. VERIFY SECRETS:');
    console.log('   - Check if AZURE_STATIC_WEB_APPS_API_TOKEN_WHITE_SKY_0A7E9F003 is valid');
    console.log('   - Token might have expired or been regenerated');

    console.log('\n4. FORCE REBUILD:');
    console.log('   - Delete and recreate Azure Static Web Apps resource');
    console.log('   - Update GitHub secrets with new token');

    console.log('\n📊 CURRENT STATUS SUMMARY:');
    console.log('================================================================================');
    console.log('❌ Frontend: Not accessible (404 errors)');
    console.log('❌ Backend: Timeout issues (authentication fixed but still not responding)');
    console.log('⚠️ Deployment: Multiple attempts made, issues persist');
    
    console.log('\n🎯 RECOMMENDED IMMEDIATE ACTION:');
    console.log('1. Check GitHub Actions for workflow status');
    console.log('2. Manually trigger frontend deployment if needed');
    console.log('3. Check Azure Portal for any service issues');
    console.log('4. Consider recreating Azure resources if tokens are invalid');
}

debugFrontendIssue().catch(console.error);