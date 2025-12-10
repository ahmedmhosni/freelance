const axios = require('axios');

async function monitorFrontendDeployment() {
    console.log('\n🌐 MONITORING FRONTEND DEPLOYMENT');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('Commit: 68eb22b - Force frontend deployment');
    console.log('================================================================================\n');

    const frontendUrl = 'https://white-sky-0a7e9f003.4.azurestaticapps.net';
    const maxAttempts = 15;
    const delayBetweenAttempts = 20000; // 20 seconds

    console.log('🔗 GitHub Actions: https://github.com/ahmedmhosni/freelance/actions');
    console.log('🌐 Frontend URL: ' + frontendUrl);
    console.log('⏳ Expected deployment time: 3-5 minutes\n');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔄 Attempt ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
        
        try {
            const response = await axios.get(frontendUrl, {
                timeout: 10000,
                validateStatus: (status) => status < 500,
                headers: {
                    'User-Agent': 'Frontend-Deployment-Monitor/1.0',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (response.status === 200) {
                console.log('✅ FRONTEND IS LIVE! Status: 200');
                console.log('🎉 Frontend deployment successful!');
                
                // Check if it's actually the app content
                const contentLength = response.headers['content-length'];
                const contentType = response.headers['content-type'];
                
                console.log(`📊 Content-Type: ${contentType}`);
                console.log(`📊 Content-Length: ${contentLength} bytes`);
                
                if (contentType && contentType.includes('text/html') && contentLength > 1000) {
                    console.log('✅ Frontend appears to be serving the actual application!');
                    return true;
                } else {
                    console.log('⚠️ Frontend is responding but might be serving placeholder content');
                }
                
            } else if (response.status === 404) {
                console.log('⏳ Status: 404 - Still deploying...');
            } else {
                console.log(`⚠️ Status: ${response.status} - Unexpected response`);
            }
            
        } catch (error) {
            if (error.code === 'ETIMEDOUT') {
                console.log('⏳ Timeout - Service might be starting...');
            } else if (error.response && error.response.status === 404) {
                console.log('⏳ 404 - Deployment still in progress...');
            } else {
                console.log(`⏳ ${error.message.substring(0, 50)}... - Still deploying`);
            }
        }
        
        if (attempt < maxAttempts) {
            console.log(`⏳ Waiting ${delayBetweenAttempts/1000} seconds before next check...\n`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        }
    }
    
    console.log('\n⚠️ Frontend deployment monitoring completed');
    console.log('🔍 Check GitHub Actions for deployment status');
    console.log('🔗 https://github.com/ahmedmhosni/freelance/actions');
    
    return false;
}

// Also test the backend while we're at it
async function quickBackendTest() {
    console.log('\n🚀 QUICK BACKEND TEST');
    console.log('--------------------------------------------------------------------------------');
    
    const backendUrl = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
    
    try {
        const response = await axios.get(backendUrl + '/health', {
            timeout: 8000,
            validateStatus: (status) => status < 500
        });
        
        if (response.status === 200) {
            console.log('✅ Backend Health: WORKING');
            console.log('📊 Response:', JSON.stringify(response.data).substring(0, 100));
        } else {
            console.log(`⚠️ Backend Health: ${response.status}`);
        }
        
    } catch (error) {
        if (error.code === 'ETIMEDOUT') {
            console.log('⏳ Backend Health: Timeout (still starting...)');
        } else {
            console.log(`⏳ Backend Health: ${error.message.substring(0, 50)}...`);
        }
    }
}

async function runMonitoring() {
    await quickBackendTest();
    await monitorFrontendDeployment();
}

runMonitoring().catch(console.error);