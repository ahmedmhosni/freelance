const axios = require('axios');

async function testFixes() {
    console.log('\n🔧 TESTING PROFILE AND REPORTS FIXES');
    console.log('================================================================================');
    
    const baseURL = 'http://localhost:5000';
    
    try {
        // Test 1: Login to get token
        console.log('\n1. 🔐 Logging in...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'test@test.com',
            password: 'TestPassword123!'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Test 2: Test profile endpoint (should return 200, not 302)
        console.log('\n2. 👤 Testing profile endpoint...');
        const profileResponse = await axios.get(`${baseURL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Profile Status: ${profileResponse.status}`);
        console.log(`✅ Profile Data: ${profileResponse.data.profile.name} (${profileResponse.data.profile.email})`);
        
        // Test 3: Test reports endpoint (should return 200 with available reports)
        console.log('\n3. 📊 Testing reports endpoint...');
        const reportsResponse = await axios.get(`${baseURL}/api/reports`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Reports Status: ${reportsResponse.status}`);
        console.log(`✅ Available Reports: ${reportsResponse.data.total} reports found`);
        console.log('📋 Reports List:');
        reportsResponse.data.reports.forEach(report => {
            console.log(`   - ${report.name}: ${report.endpoint}`);
        });
        
        // Test 4: Test a specific report
        console.log('\n4. 📈 Testing financial report...');
        const financialResponse = await axios.get(`${baseURL}/api/reports/financial`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Financial Report Status: ${financialResponse.status}`);
        console.log(`✅ Financial Report Data: ${JSON.stringify(financialResponse.data, null, 2).substring(0, 200)}...`);
        
        console.log('\n================================================================================');
        console.log('🎉 ALL FIXES VERIFIED SUCCESSFULLY!');
        console.log('================================================================================');
        
    } catch (error) {
        console.error('❌ Error during testing:', error.response?.data || error.message);
    }
}

testFixes();