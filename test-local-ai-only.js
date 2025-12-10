const axios = require('axios');

async function testLocalAI() {
    console.log('🤖 TESTING LOCAL AI ASSISTANT');
    console.log('==============================');
    
    const baseUrl = 'http://localhost:5000';
    
    // Test 1: AI Status
    console.log('🔄 Testing AI Status...');
    try {
        const status = await axios.get(`${baseUrl}/api/ai/status`);
        console.log('✅ AI Status Response:');
        console.log(JSON.stringify(status.data, null, 2));
    } catch (error) {
        console.log(`❌ AI Status Error: ${error.message}`);
    }
    
    // Test 2: Try AI Chat (without auth for testing)
    console.log('\n🔄 Testing AI Chat...');
    try {
        const chat = await axios.post(`${baseUrl}/api/ai/chat`, {
            message: 'Hello, can you help me?'
        }, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
        });
        
        console.log(`Status: ${chat.status}`);
        if (chat.status === 200) {
            console.log('✅ AI Chat Response:');
            console.log(JSON.stringify(chat.data, null, 2));
        } else if (chat.status === 401) {
            console.log('🔐 AI Chat requires authentication (normal behavior)');
        } else {
            console.log('Response:', chat.data);
        }
    } catch (error) {
        console.log(`❌ AI Chat Error: ${error.message}`);
    }
    
    // Test 3: Check if frontend can see AI widget
    console.log('\n🔄 Testing Frontend AI Widget...');
    try {
        const frontend = await axios.get('http://localhost:3000');
        if (frontend.data.includes('AIAssistant') || frontend.data.includes('AI Assistant')) {
            console.log('✅ Frontend includes AI Assistant component');
        } else {
            console.log('⚠️ AI Assistant component not found in frontend');
        }
    } catch (error) {
        console.log(`❌ Frontend test failed: ${error.message}`);
    }
    
    console.log('\n🎯 INSTRUCTIONS TO TEST AI LOCALLY:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Look for AI chat widget in bottom-right corner');
    console.log('3. Click the widget to open chat');
    console.log('4. Type a message and send');
    console.log('5. AI should respond using Gemini API');
}

testLocalAI().catch(console.error);