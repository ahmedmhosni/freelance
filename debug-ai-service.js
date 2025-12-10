const axios = require('axios');

async function debugAIService() {
    console.log('🔍 DEBUGGING AI SERVICE STATUS');
    console.log('==============================');
    
    try {
        const response = await axios.get('http://localhost:5000/api/ai/status');
        console.log('AI Status Response:', JSON.stringify(response.data, null, 2));
        
        if (!response.data.enabled) {
            console.log('\n❌ AI is disabled. Possible reasons:');
            console.log('1. GEMINI_API_KEY not set in environment');
            console.log('2. AI settings in database have enabled=false');
            console.log('3. AI service initialization failed');
            console.log('4. Provider initialization failed');
        }
        
    } catch (error) {
        console.log('Error:', error.message);
    }
}

debugAIService().catch(console.error);