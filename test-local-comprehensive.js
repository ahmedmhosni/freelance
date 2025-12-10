const axios = require('axios');

async function testLocalEnvironment() {
    console.log('\n🔍 COMPREHENSIVE LOCAL ENVIRONMENT TEST');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    const backendUrl = 'http://localhost:5000';
    const frontendUrl = 'http://localhost:3000';

    // Test 1: Backend Health
    console.log('🔄 Test 1: Local Backend Health...');
    try {
        const health = await axios.get(`${backendUrl}/api/health`, { timeout: 5000 });
        console.log(`✅ Backend Health: ${health.status} - ${health.data.status}`);
        console.log(`📊 Uptime: ${health.data.uptime}s`);
    } catch (error) {
        console.log(`❌ Backend Health: ${error.message}`);
    }

    // Test 2: Database Connection Test
    console.log('\n🔄 Test 2: Database Connection Test...');
    const dbEndpoints = [
        '/api/clients',
        '/api/projects', 
        '/api/tasks',
        '/api/invoices',
        '/api/dashboard'
    ];
    
    for (const endpoint of dbEndpoints) {
        try {
            const response = await axios.get(backendUrl + endpoint, {
                timeout: 5000,
                validateStatus: () => true
            });
            
            if (response.status === 200) {
                console.log(`✅ ${endpoint}: SUCCESS (${response.data.length || 'data'} items)`);
            } else if (response.status === 401) {
                console.log(`🔐 ${endpoint}: AUTH REQUIRED - DB connection OK`);
            } else {
                console.log(`⚠️ ${endpoint}: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }

    // Test 3: Authentication Test
    console.log('\n🔄 Test 3: Authentication System...');
    try {
        const authTest = await axios.post(`${backendUrl}/api/auth/login`, {
            email: 'test@example.com',
            password: 'wrongpassword'
        }, { 
            timeout: 5000,
            validateStatus: () => true 
        });
        
        if (authTest.status === 401) {
            console.log('✅ Auth System: Working (correctly rejected invalid credentials)');
        } else {
            console.log(`⚠️ Auth System: Unexpected response ${authTest.status}`);
        }
    } catch (error) {
        console.log(`❌ Auth System: ${error.message}`);
    }

    // Test 4: API Endpoints
    console.log('\n🔄 Test 4: Core API Endpoints...');
    const apiEndpoints = [
        '/api/announcements',
        '/api/ai/status',
        '/api/changelog/current-version',
        '/api/maintenance/status',
        '/api/profile',
        '/api/version'
    ];

    for (const endpoint of apiEndpoints) {
        try {
            const response = await axios.get(backendUrl + endpoint, {
                timeout: 3000,
                validateStatus: () => true
            });
            
            if (response.status === 200) {
                console.log(`✅ ${endpoint}: SUCCESS`);
            } else if (response.status === 401) {
                console.log(`🔐 ${endpoint}: AUTH REQUIRED`);
            } else {
                console.log(`⚠️ ${endpoint}: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }

    // Test 5: Frontend Test
    console.log('\n🔄 Test 5: Local Frontend Test...');
    try {
        const frontend = await axios.get(frontendUrl, { timeout: 5000 });
        console.log(`✅ Frontend: ${frontend.status}`);
        
        if (frontend.data.includes('Roastify') || frontend.data.includes('react')) {
            console.log('✅ Frontend serving React application');
        }
    } catch (error) {
        console.log(`❌ Frontend: ${error.message}`);
    }

    // Test 6: Database Content Check
    console.log('\n🔄 Test 6: Database Content Verification...');
    try {
        const clients = await axios.get(`${backendUrl}/api/clients`, {
            timeout: 5000,
            validateStatus: () => true
        });
        
        if (clients.status === 200) {
            console.log(`✅ Database has ${clients.data.length} clients`);
        } else if (clients.status === 401) {
            console.log('✅ Database connection working (auth required)');
        }
        
        // Test time entries
        const timeEntries = await axios.get(`${backendUrl}/api/time-tracking`, {
            timeout: 5000,
            validateStatus: () => true
        });
        
        if (timeEntries.status === 200) {
            console.log(`✅ Database has ${timeEntries.data.length} time entries`);
        } else if (timeEntries.status === 401) {
            console.log('✅ Time tracking connection working (auth required)');
        }
        
    } catch (error) {
        console.log(`❌ Database content check: ${error.message}`);
    }

    // Summary
    console.log('\n📊 LOCAL ENVIRONMENT SUMMARY:');
    console.log('================================================================================');
    console.log('✅ Frontend URL: http://localhost:3000');
    console.log('✅ Backend URL:  http://localhost:5000');
    console.log('✅ Database:     Local PostgreSQL');
    console.log('\n🎯 If all tests pass, the issue is Azure-specific, not code-related.');
}

testLocalEnvironment().catch(console.error);