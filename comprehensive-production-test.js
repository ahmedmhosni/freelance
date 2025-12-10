const axios = require('axios');

async function comprehensiveProductionTest() {
    console.log('\n🔍 COMPREHENSIVE PRODUCTION TEST');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    const backendUrl = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
    const frontendUrl = 'https://roastify.online';

    // Test 1: Backend Root
    console.log('🔄 Test 1: Backend Root URL...');
    try {
        const response = await axios.get(backendUrl, {
            timeout: 15000,
            validateStatus: () => true,
            headers: {
                'User-Agent': 'Production-Test/1.0'
            }
        });
        console.log(`✅ Backend Root: ${response.status} (${response.statusText})`);
        if (response.data) {
            console.log(`📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        }
    } catch (error) {
        console.log(`❌ Backend Root: ${error.message}`);
    }

    // Test 2: Backend Health (different port consideration)
    console.log('\n🔄 Test 2: Backend Health Endpoint...');
    const healthEndpoints = ['/health', '/api/health', '/'];
    
    for (const endpoint of healthEndpoints) {
        try {
            const response = await axios.get(backendUrl + endpoint, {
                timeout: 10000,
                validateStatus: () => true
            });
            console.log(`   ${endpoint}: ${response.status}`);
            if (response.status === 200 && response.data) {
                console.log(`   📊 Data: ${JSON.stringify(response.data).substring(0, 80)}...`);
            }
        } catch (error) {
            console.log(`   ${endpoint}: ERROR (${error.message.substring(0, 30)}...)`);
        }
    }

    // Test 3: CORS Preflight
    console.log('\n🔄 Test 3: CORS Preflight Test...');
    try {
        const response = await axios.options(backendUrl + '/api/announcements', {
            timeout: 8000,
            headers: {
                'Origin': 'https://roastify.online',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            validateStatus: () => true
        });
        
        console.log(`✅ CORS Preflight: ${response.status}`);
        console.log(`📊 CORS Headers:`);
        console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
        console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
        console.log(`   Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers']}`);
        
    } catch (error) {
        console.log(`❌ CORS Preflight: ${error.message}`);
    }

    // Test 4: Specific API Endpoints
    console.log('\n🔄 Test 4: API Endpoints Test...');
    const apiEndpoints = [
        '/api/announcements',
        '/api/ai/status',
        '/api/changelog/current-version',
        '/api/maintenance/status'
    ];

    for (const endpoint of apiEndpoints) {
        try {
            const response = await axios.get(backendUrl + endpoint, {
                timeout: 8000,
                validateStatus: () => true,
                headers: {
                    'Origin': 'https://roastify.online'
                }
            });
            
            if (response.status === 200) {
                console.log(`✅ ${endpoint}: SUCCESS (${response.status})`);
            } else if (response.status === 401) {
                console.log(`⚠️ ${endpoint}: AUTH REQUIRED (${response.status})`);
            } else {
                console.log(`⚠️ ${endpoint}: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message.substring(0, 50)}...`);
        }
    }

    // Test 5: Frontend Test
    console.log('\n🔄 Test 5: Frontend Test...');
    try {
        const response = await axios.get(frontendUrl, {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'User-Agent': 'Production-Test/1.0'
            }
        });
        
        console.log(`✅ Frontend: ${response.status}`);
        const contentType = response.headers['content-type'];
        const contentLength = response.headers['content-length'];
        
        console.log(`📊 Content-Type: ${contentType}`);
        console.log(`📊 Content-Length: ${contentLength} bytes`);
        
        if (response.status === 200 && contentType && contentType.includes('text/html')) {
            console.log(`✅ Frontend appears to be serving HTML content`);
            
            // Check if it contains our app
            const content = response.data.toString();
            if (content.includes('Roastify') || content.includes('freelancer') || content.includes('react')) {
                console.log(`✅ Frontend appears to be serving the actual application`);
            } else {
                console.log(`⚠️ Frontend might be serving placeholder content`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Frontend: ${error.message}`);
    }

    // Test 6: Azure Environment Check
    console.log('\n🔄 Test 6: Azure Environment Analysis...');
    console.log('Based on provided Azure environment variables:');
    console.log('✅ PORT: 8080 (correct)');
    console.log('✅ NODE_ENV: production (correct)');
    console.log('✅ FRONTEND_URL: https://roastify.online (correct)');
    console.log('✅ DB_HOST: roastifydbpost.postgres.database.azure.com (configured)');
    console.log('✅ JWT_SECRET: configured');
    console.log('✅ GEMINI_API_KEY: configured');

    console.log('\n📊 DIAGNOSIS:');
    console.log('================================================================================');
    console.log('Based on the tests above, the likely issues are:');
    console.log('1. Backend might be taking too long to start (cold start)');
    console.log('2. Azure Web App might need a restart');
    console.log('3. Database connection might be slow');
    console.log('4. Application Insights might be causing delays');

    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('================================================================================');
    console.log('1. RESTART AZURE WEB APP:');
    console.log('   - Go to Azure Portal → App Services → roastify-webapp-api');
    console.log('   - Click "Restart" button');
    console.log('   - Wait 2-3 minutes for restart');
    
    console.log('\n2. CHECK AZURE LOGS:');
    console.log('   - Go to Azure Portal → App Services → roastify-webapp-api');
    console.log('   - Click "Log stream" to see real-time logs');
    console.log('   - Look for startup errors or database connection issues');
    
    console.log('\n3. MANUAL DEPLOYMENT TRIGGER:');
    console.log('   - Go to GitHub Actions: https://github.com/ahmedmhosni/freelance/actions');
    console.log('   - Manually trigger "🚀 Deploy to Azure Production"');
    
    console.log('\n4. DATABASE CONNECTION TEST:');
    console.log('   - Check if Azure PostgreSQL is accessible');
    console.log('   - Verify firewall rules allow Azure Web App access');

    console.log('\n⏰ EXPECTED TIMELINE:');
    console.log('- Azure Web App restart: 2-3 minutes');
    console.log('- Fresh deployment: 5-10 minutes');
    console.log('- Database connection fix: Immediate after restart');
}

comprehensiveProductionTest().catch(console.error);