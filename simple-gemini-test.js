require('dotenv').config({ path: './backend/.env' });

async function simpleGeminiTest() {
  console.log('\n🔍 SIMPLE GEMINI API TEST');
  console.log('================================================================================');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names
    const modelsToTry = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest'
    ];
    
    for (const modelName of modelsToTry) {
      console.log(`\n🔄 Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, respond with just "OK"');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works! Response: ${text}`);
        
        console.log('\n🎯 WORKING MODEL FOUND!');
        console.log(`Use this model: ${modelName}`);
        return;
        
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message.substring(0, 100)}...`);
      }
    }
    
    console.log('\n❌ No working models found');
    
  } catch (error) {
    console.log('\n❌ GEMINI TEST FAILED');
    console.log('Error:', error.message);
  }
}

simpleGeminiTest();