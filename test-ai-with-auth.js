const axios = require('axios');

async function testAIWithAuth() {
    console.log('🔐 TESTING AI MODULE WITH AUTHENTICATION');
    console.log('========================================');
    
    const baseUrl = 'http://localhost:5000';
    
    // First, let's try to login as admin
    console.log('🔄 Step 1: Login as admin...');
    try {
        const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
            email: 'admin@roastify.com',
            password: 'admin123'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
            const token = loginResponse.data.data?.token || loginResponse.data.token;
            
            // Test AI admin endpoints with authentication
            console.log('\n🔄 Step 2: Testing AI admin settings...');
            try {
                const settingsResponse = await axios.get(`${baseUrl}/api/ai/admin/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('✅ AI Settings:', JSON.stringify(settingsResponse.data, null, 2));
            } catch (error) {
                console.log('❌ AI Settings Error:', error.response?.data || error.message);
            }
            
            // Test AI connection
            console.log('\n🔄 Step 3: Testing AI connection...');
            try {
                const connectionResponse = await axios.post(`${baseUrl}/api/ai/admin/test-connection`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('✅ AI Connection Test:', JSON.stringify(connectionResponse.data, null, 2));
            } catch (error) {
                console.log('❌ AI Connection Error:', error.response?.data || error.message);
            }
            
        } else {
            console.log('❌ Admin login failed:', loginResponse.data);
        }
        
    } catch (error) {
        console.log('❌ Login error:', error.response?.data || error.message);
        console.log('\n💡 Note: You may need to create an admin user first.');
        console.log('   Try running: node create-admin-user.js');
    }
}

testAIWithAuth().catch(console.error);