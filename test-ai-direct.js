// Direct test of AI service without authentication
const axios = require('axios');

async function testAIDirect() {
    console.log('🤖 DIRECT AI SERVICE TEST');
    console.log('=========================');
    
    // Test the AI service directly by checking the backend logs
    console.log('Testing if AI service is properly initialized...');
    
    try {
        // Check if we can access the AI status
        const response = await axios.get('http://localhost:5000/api/ai/status');
        console.log('✅ AI Service Status:', response.data);
        
        if (response.data.enabled) {
            console.log('✅ AI Assistant is ENABLED and ready to use');
            console.log('');
            console.log('🎯 TO TEST THE AI ASSISTANT:');
            console.log('1. Open your browser to: http://localhost:3000');
            console.log('2. Look for a floating chat button in the bottom-right corner');
            console.log('3. Click the chat button to open the AI Assistant');
            console.log('4. Type a message like "Hello" and press Enter');
            console.log('5. The AI should respond using Google Gemini');
            console.log('');
            console.log('📝 NOTE: You may need to be logged in to use the AI chat');
        } else {
            console.log('❌ AI Assistant is disabled');
        }
        
    } catch (error) {
        console.log('❌ Error testing AI service:', error.message);
    }
}

testAIDirect().catch(console.error);