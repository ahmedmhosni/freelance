const axios = require('axios');

async function monitorDeployment() {
    console.log('\n🔍 MONITORING AZURE DEPLOYMENT PROGRESS');
    console.log('================================================================================');
    console.log('⏳ Waiting for deployments to complete...');
    console.log('🔗 GitHub Actions: https://github.com/ahmedmhosni/freelance/actions');
    console.log('================================================================================\n');

    const services = [
        {
            name: '🚀 Backend API',
            url: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/health',
            expectedDelay: 120 // Backend takes longer to deploy
        },
        {
            name: '🌐 Frontend App',
            url: 'https://white-sky-0a7e9f003.4.azurestaticapps.net',
            expectedDelay: 60 // Frontend deploys faster
        }
    ];

    const maxAttempts = 20;
    const delayBetweenAttempts = 30000; // 30 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`\n🔄 Attempt ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
        console.log('--------------------------------------------------------------------------------');
        
        let allHealthy = true;
        
        for (const service of services) {
            try {
                const response = await axios.get(service.url, {
                    timeout: 10000,
                    validateStatus: (status) => status < 500
                });
                
                if (response.status >= 200 && response.status < 400) {
                    console.log(`✅ ${service.name}: LIVE (${response.status})`);
                } else {
                    console.log(`⚠️ ${service.name}: ${response.status} (deploying...)`);
                    allHealthy = false;
                }
                
            } catch (error) {
                if (error.code === 'ETIMEDOUT') {
                    console.log(`⏳ ${service.name}: Timeout (still deploying...)`);
                } else if (error.response && error.response.status === 404) {
                    console.log(`⏳ ${service.name}: 404 (deployment in progress...)`);
                } else {
                    console.log(`⏳ ${service.name}: ${error.message} (deploying...)`);
                }
                allHealthy = false;
            }
        }
        
        if (allHealthy) {
            console.log('\n🎉 ALL SERVICES ARE LIVE! 🎉');
            console.log('================================================================================');
            console.log('✅ Backend API: https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net');
            console.log('✅ Frontend App: https://white-sky-0a7e9f003.4.azurestaticapps.net');
            console.log('🚀 Your application is fully deployed and ready!');
            return true;
        }
        
        if (attempt < maxAttempts) {
            console.log(`\n⏳ Waiting ${delayBetweenAttempts/1000} seconds before next check...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        }
    }
    
    console.log('\n⚠️ Deployment monitoring completed');
    console.log('🔍 Check GitHub Actions for deployment status: https://github.com/ahmedmhosni/freelance/actions');
    return false;
}

// Run monitoring
monitorDeployment().catch(console.error);