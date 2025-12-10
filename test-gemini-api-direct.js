require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

async function testGeminiAPIDirect() {
  console.log('\n🔍 TESTING GEMINI API DIRECTLY');
  console.log('================================================================================');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  // Test different API endpoints and models
  const testCases = [
    {
      name: 'List Models (v1)',
      url: `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      method: 'GET'
    },
    {
      name: 'List Models (v1beta)',
      url: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      method: 'GET'
    },
    {
      name: 'Generate Content - gemini-pro (v1)',
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      method: 'POST',
      data: {
        contents: [{
          parts: [{ text: 'Hello, respond with just "OK"' }]
        }]
      }
    },
    {
      name: 'Generate Content - gemini-1.5-flash (v1beta)',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      data: {
        contents: [{
          parts: [{ text: 'Hello, respond with just "OK"' }]
        }]
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔄 Testing: ${testCase.name}`);
    
    try {
      const config = {
        method: testCase.method,
        url: testCase.url,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (testCase.data) {
        config.data = testCase.data;
      }
      
      const response = await axios(config);
      
      console.log(`✅ SUCCESS: ${testCase.name}`);
      console.log(`   Status: ${response.status}`);
      
      if (testCase.name.includes('List Models')) {
        const models = response.data.models || [];
        console.log(`   Found ${models.length} models:`);
        models.slice(0, 5).forEach(model => {
          console.log(`   - ${model.name}`);
        });
        if (models.length > 5) {
          console.log(`   ... and ${models.length - 5} more`);
        }
      } else {
        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`   Response: ${text || 'No text response'}`);
      }
      
      // If we found a working model, return it
      if (testCase.name.includes('Generate Content') && response.status === 200) {
        const modelName = testCase.url.match(/models\/([^:]+):/)?.[1];
        console.log(`\n🎯 WORKING MODEL FOUND: ${modelName}`);
        return modelName;
      }
      
    } catch (error) {
      console.log(`❌ FAILED: ${testCase.name}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.error?.message || error.response.statusText}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n📊 DIAGNOSIS');
  console.log('================================================================================');
  console.log('If all tests failed, the issue could be:');
  console.log('1. Invalid or expired API key');
  console.log('2. API key lacks necessary permissions');
  console.log('3. Billing not enabled for the Google Cloud project');
  console.log('4. Regional restrictions');
  console.log('5. API quota completely exhausted');
}

testGeminiAPIDirect();