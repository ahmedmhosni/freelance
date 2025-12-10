const axios = require('axios');

async function testLiveDeployment() {
    console.log('\n🔍 TESTING LIVE AZURE DEPLOYMENT STATUS');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    const services = [
        {
            name: '🚀 Backend API',
            url: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net',
            healthEndpoint: '/health',
            type: 'api'
        },
        {
            name: '🌐 Frontend App',
            url: 'https://white-sky-0a7e9f003.4.azurestaticapps.net',
            healthEndpoint: '/',
            type: 'frontend'
        },
        {
            name: '📊 Status Page',
            url: 'https://status.roastify.com', // Assuming this is configured
            healthEndpoint: '/',
            type: 'status',
            optional: true
        }
    ];

    let allHealthy = true;
    const results = [];

    for (const service of services) {
        try {
            console.log(`🔄 Testing ${service.name}...`);
            console.log(`   URL: ${service.url}${service.healthEndpoint}`);
            
            const startTime = Date.now();
            const response = await axios.get(service.url + service.healthEndpoint, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Deployment-Health-Check/1.0'
                }
            });
            const responseTime = Date.now() - startTime;
            
            const isHealthy = response.status >= 200 && response.status < 400;
            
            if (isHealthy) {
                console.log(`   ✅ Status: ${response.status} (${responseTime}ms)`);
                if (service.type === 'api' && response.data) {
                    console.log(`   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
                }
            } else {
                console.log(`   ⚠️ Status: ${response.status} (${responseTime}ms)`);
                if (!service.optional) allHealthy = false;
            }
            
            results.push({
                service: service.name,
                url: service.url,
                status: response.status,
                responseTime,
                healthy: isHealthy,
                optional: service.optional || false
            });
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            if (error.code === 'ENOTFOUND') {
                console.log(`   🔍 DNS resolution failed - service might not be configured`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`   🔍 Connection refused - service might be down`);
            } else if (error.code === 'ETIMEDOUT') {
                console.log(`   🔍 Request timeout - service might be slow to respond`);
            }
            
            results.push({
                service: service.name,
                url: service.url,
                status: 'ERROR',
                error: error.message,
                healthy: false,
                optional: service.optional || false
            });
            
            if (!service.optional) allHealthy = false;
        }
        
        console.log('');
    }

    // Test specific API endpoints
    console.log('🔍 TESTING SPECIFIC API ENDPOINTS');
    console.log('--------------------------------------------------------------------------------');
    
    const apiEndpoints = [
        '/api/health',
        '/api/profile',
        '/api/reports',
        '/api/ai/status',
        '/api/announcements',
        '/api/changelog/current-version'
    ];

    const baseApiUrl = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
    
    for (const endpoint of apiEndpoints) {
        try {
            console.log(`🔄 Testing ${endpoint}...`);
            const response = await axios.get(baseApiUrl + endpoint, {
                timeout: 5000,
                validateStatus: (status) => status < 500 // Accept 4xx as valid responses
            });
            
            if (response.status < 400) {
                console.log(`   ✅ ${endpoint}: ${response.status}`);
            } else {
                console.log(`   ⚠️ ${endpoint}: ${response.status} (might need authentication)`);
            }
            
        } catch (error) {
            console.log(`   ❌ ${endpoint}: ${error.message}`);
        }
    }

    console.log('\n================================================================================');
    console.log('📊 DEPLOYMENT STATUS SUMMARY');
    console.log('================================================================================');
    
    results.forEach(result => {
        const status = result.healthy ? '✅' : (result.optional ? '⚠️' : '❌');
        const responseInfo = result.responseTime ? `(${result.responseTime}ms)` : '';
        console.log(`${status} ${result.service}: ${result.status} ${responseInfo}`);
        if (result.error && !result.optional) {
            console.log(`   Error: ${result.error}`);
        }
    });

    console.log('\n🎯 OVERALL STATUS:');
    if (allHealthy) {
        console.log('✅ ALL CRITICAL SERVICES ARE LIVE AND HEALTHY! 🎉');
        console.log('🚀 Your application is fully deployed and ready for users');
    } else {
        console.log('⚠️ Some services need attention');
        console.log('🔧 Check the errors above and redeploy if necessary');
    }

    console.log('\n📋 QUICK ACTIONS:');
    console.log('- Frontend URL: https://white-sky-0a7e9f003.4.azurestaticapps.net');
    console.log('- Backend API: https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net');
    console.log('- GitHub Actions: https://github.com/ahmedmhosni/freelance/actions');
    
    return allHealthy;
}

// Run the test
testLiveDeployment().catch(console.error);