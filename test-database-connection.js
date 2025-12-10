const axios = require('axios');

async function testDatabaseEndpoints() {
    console.log('🔍 TESTING DATABASE-DEPENDENT ENDPOINTS');
    console.log('=====================================');
    
    const baseUrl = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';
    
    const endpoints = [
        '/api/clients',
        '/api/projects', 
        '/api/tasks',
        '/api/invoices',
        '/api/auth/me',
        '/api/dashboard',
        '/api/profile'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(baseUrl + endpoint, {
                timeout: 8000,
                validateStatus: () => true
            });
            
            if (response.status === 200) {
                console.log(`✅ ${endpoint}: SUCCESS`);
            } else if (response.status === 401) {
                console.log(`🔐 ${endpoint}: AUTH REQUIRED (${response.status}) - DB connection OK`);
            } else if (response.status === 500) {
                console.log(`❌ ${endpoint}: DATABASE ERROR (${response.status})`);
                if (response.data && response.data.error) {
                    console.log(`   Error: ${response.data.error.message || response.data.error}`);
                }
            } else {
                console.log(`⚠️ ${endpoint}: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
    
    console.log('\n🔧 DIAGNOSIS:');
    console.log('If you see "AUTH REQUIRED" - Database is working!');
    console.log('If you see "DATABASE ERROR" - Database connection issue');
    console.log('If you see timeouts - Backend still starting up');
}

testDatabaseEndpoints().catch(console.error);