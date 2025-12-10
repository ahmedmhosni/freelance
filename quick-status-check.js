const axios = require('axios');

async function quickStatusCheck() {
    console.log(`\n🔍 QUICK STATUS CHECK - ${new Date().toLocaleTimeString()}`);
    console.log('================================================================================');
    
    const tests = [
        {
            name: '🚀 Backend Health',
            url: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/health'
        },
        {
            name: '🤖 AI Status',
            url: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/ai/status'
        },
        {
            name: '📢 Announcements',
            url: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/announcements'
        },
        {
            name: '🌐 Frontend',
            url: 'https://white-sky-0a7e9f003.4.azurestaticapps.net'
        }
    ];

    let workingCount = 0;
    
    for (const test of tests) {
        try {
            const response = await axios.get(test.url, { 
                timeout: 8000,
                validateStatus: (status) => status < 500
            });
            
            if (response.status >= 200 && response.status < 400) {
                console.log(`✅ ${test.name}: WORKING (${response.status})`);
                workingCount++;
            } else {
                console.log(`⚠️ ${test.name}: ${response.status} (needs auth or deploying)`);
            }
            
        } catch (error) {
            if (error.code === 'ETIMEDOUT') {
                console.log(`⏳ ${test.name}: Timeout (still starting...)`);
            } else if (error.response?.status === 404) {
                console.log(`⏳ ${test.name}: 404 (deployment in progress...)`);
            } else {
                console.log(`⏳ ${test.name}: ${error.message.substring(0, 50)}...`);
            }
        }
    }
    
    console.log(`\n📊 Status: ${workingCount}/${tests.length} services responding`);
    
    if (workingCount >= 2) {
        console.log('🎉 BACKEND IS COMING ONLINE! Some services are already working!');
    }
    
    if (workingCount === tests.length) {
        console.log('🚀 ALL SERVICES ARE LIVE! 🚀');
        return true;
    }
    
    return false;
}

quickStatusCheck().catch(console.error);