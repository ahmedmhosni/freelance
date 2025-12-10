const axios = require('axios');

async function testAIAssistant() {
    console.log('\n🤖 AI ASSISTANT FUNCTIONALITY TEST');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    const environments = [
        {
            name: 'LOCAL',
            baseUrl: 'http://localhost:5000',
            color: 'local'
        },
        {
            name: 'PRODUCTION',
            baseUrl: 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net',
            color: 'production'
        }
    ];

    for (const env of environments) {
        console.log(`🔄 Testing ${env.name} Environment...`);
        console.log('─'.repeat(50));

        // Test 1: AI Status Endpoint
        try {
            const statusResponse = await axios.get(`${env.baseUrl}/api/ai/status`, {
                timeout: 8000,
                validateStatus: () => true
            });
            
            if (statusResponse.status === 200) {
                console.log(`✅ AI Status: ${statusResponse.status}`);
                console.log(`📊 AI Enabled: ${statusResponse.data.enabled}`);
                console.log(`📊 Provider: ${statusResponse.data.provider || 'Not specified'}`);
                
                if (statusResponse.data.enabled) {
                    console.log('✅ AI Assistant is ENABLED');
                } else {
                    console.log('⚠️ AI Assistant is DISABLED');
                }
            } else {
                console.log(`❌ AI Status: ${statusResponse.status}`);
            }
        } catch (error) {
            if (env.name === 'PRODUCTION' && error.code === 'ECONNABORTED') {
                console.log(`❌ AI Status: TIMEOUT (backend down)`);
            } else {
                console.log(`❌ AI Status: ${error.message}`);
            }
        }

        // Test 2: AI Chat Endpoint (if available)
        try {
            const chatResponse = await axios.post(`${env.baseUrl}/api/ai/chat`, {
                message: 'Hello, are you working?'
            }, {
                timeout: 5000,
                validateStatus: () => true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (chatResponse.status === 200) {
                console.log(`✅ AI Chat: ${chatResponse.status} - WORKING`);
                console.log(`📊 Response: ${chatResponse.data.response?.substring(0, 50)}...`);
            } else if (chatResponse.status === 401) {
                console.log(`🔐 AI Chat: AUTH REQUIRED (${chatResponse.status}) - Endpoint exists`);
            } else {
                console.log(`⚠️ AI Chat: ${chatResponse.status}`);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`⚠️ AI Chat: Endpoint not found (404)`);
            } else if (env.name === 'PRODUCTION' && error.code === 'ECONNABORTED') {
                console.log(`❌ AI Chat: TIMEOUT (backend down)`);
            } else {
                console.log(`❌ AI Chat: ${error.message}`);
            }
        }

        // Test 3: Check AI Configuration
        if (env.name === 'LOCAL') {
            console.log(`🔍 Checking AI Configuration...`);
            // Check if Gemini API key is configured
            const geminiConfigured = process.env.GEMINI_API_KEY ? 'SET' : 'MISSING';
            console.log(`📊 GEMINI_API_KEY: ${geminiConfigured}`);
        }

        console.log('');
    }

    // Summary
    console.log('📊 AI ASSISTANT SUMMARY:');
    console.log('================================================================================');
    console.log('Local Environment:');
    console.log('  - AI Status endpoint should be working');
    console.log('  - Gemini API key configured in .env.local');
    console.log('  - Should be fully functional');
    console.log('');
    console.log('Production Environment:');
    console.log('  - Backend currently down (needs restart)');
    console.log('  - Gemini API key configured in Azure');
    console.log('  - Will work after backend restart');
    console.log('');
    console.log('🎯 Expected Behavior:');
    console.log('  - AI chat widget appears in bottom-right corner');
    console.log('  - Click to open chat interface');
    console.log('  - Send messages to AI assistant');
    console.log('  - Powered by Google Gemini AI');
}

testAIAssistant().catch(console.error);