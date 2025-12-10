const axios = require('axios');

async function checkDeploymentStatus() {
    console.log('\n🔍 DEPLOYMENT STATUS CHECK');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    // Test with different timeout and retry strategy
    const services = [
        {
            name: '🚀 Backend API (Root)',
            url: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net',
            timeout: 15000
        },
        {
            name: '🤖 AI Status Endpoint',
            url: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/ai/status',
            timeout: 10000
        },
        {
            name: '🌐 Frontend App',
            url: 'https://white-sky-0a7e9f003.4.azurestaticapps.net',
            timeout: 10000
        }
    ];

    console.log('🔄 Testing services with extended timeouts...\n');

    for (const service of services) {
        try {
            console.log(`Testing ${service.name}...`);
            const startTime = Date.now();
            
            const response = await axios.get(service.url, {
                timeout: service.timeout,
                validateStatus: (status) => status < 500,
                headers: {
                    'User-Agent': 'Deployment-Monitor/1.0',
                    'Accept': 'application/json, text/html, */*'
                }
            });
            
            const responseTime = Date.now() - startTime;
            
            if (response.status >= 200 && response.status < 400) {
                console.log(`✅ ${service.name}: SUCCESS (${response.status}) - ${responseTime}ms`);
                
                // Show some response data for APIs
                if (service.url.includes('/api/') && response.data) {
                    console.log(`   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
                }
            } else {
                console.log(`⚠️ ${service.name}: ${response.status} - ${responseTime}ms`);
            }
            
        } catch (error) {
            if (error.code === 'ETIMEDOUT') {
                console.log(`❌ ${service.name}: TIMEOUT after ${service.timeout}ms`);
                console.log(`   🔍 This suggests the service might be down or very slow`);
            } else if (error.response) {
                console.log(`⚠️ ${service.name}: HTTP ${error.response.status}`);
                if (error.response.status === 404) {
                    console.log(`   🔍 404 - Service might still be deploying`);
                } else if (error.response.status === 502 || error.response.status === 503) {
                    console.log(`   🔍 ${error.response.status} - Service is starting up`);
                }
            } else {
                console.log(`❌ ${service.name}: ${error.message}`);
            }
        }
        console.log('');
    }

    // Check if we can reach Azure at all
    console.log('🔍 Testing Azure connectivity...');
    try {
        const azureTest = await axios.get('https://azure.microsoft.com', { timeout: 5000 });
        console.log('✅ Azure connectivity: OK');
    } catch (error) {
        console.log('❌ Azure connectivity: Issues detected');
    }

    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. Check GitHub Actions: https://github.com/ahmedmhosni/freelance/actions');
    console.log('2. If deployments are still running, wait 5-10 more minutes');
    console.log('3. If deployments failed, manually trigger them from GitHub Actions');
    console.log('4. Check Azure Portal for any service issues');
    
    console.log('\n🔗 DIRECT LINKS:');
    console.log('- GitHub Actions: https://github.com/ahmedmhosni/freelance/actions');
    console.log('- Frontend URL: https://white-sky-0a7e9f003.4.azurestaticapps.net');
    console.log('- Backend URL: https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net');
}

checkDeploymentStatus().catch(console.error);