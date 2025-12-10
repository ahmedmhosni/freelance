require('dotenv').config({ path: './backend/.env' });

async function testWorkingGeminiModels() {
  console.log('\n🔍 TESTING WORKING GEMINI MODELS');
  console.log('================================================================================');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try the most commonly available models
    const modelsToTry = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest', 
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.0-pro-latest'
    ];
    
    for (const modelName of modelsToTry) {
      console.log(`\n🔄 Testing: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Test with a simple prompt
        const result = await model.generateContent('Say "Hello" if you can hear me.');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS: ${modelName}`);
        console.log(`   Response: ${text.trim()}`);
        
        // Update the AI settings to use this working model
        console.log(`\n🔧 Updating AI settings to use: ${modelName}`);
        return modelName;
        
      } catch (error) {
        if (error.status === 429) {
          console.log(`⚠️  ${modelName}: Quota exceeded (but model exists)`);
        } else if (error.status === 404) {
          console.log(`❌ ${modelName}: Model not found`);
        } else {
          console.log(`❌ ${modelName}: ${error.message.substring(0, 80)}...`);
        }
      }
    }
    
    console.log('\n❌ No working models found');
    console.log('This could be due to:');
    console.log('1. API quota exceeded for all models');
    console.log('2. API key permissions issue');
    console.log('3. Regional availability restrictions');
    
  } catch (error) {
    console.log('\n❌ GEMINI SDK ERROR');
    console.log('Error:', error.message);
  }
}

// Run the test and update settings if a working model is found
testWorkingGeminiModels().then(async (workingModel) => {
  if (workingModel) {
    console.log(`\n🔄 Updating database to use: ${workingModel}`);
    
    // Update the AI settings in the database
    const axios = require('axios');
    try {
      // Login first
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@roastify.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.token;
        
        // Update the model
        const updateResponse = await axios.put('http://localhost:5000/api/ai/admin/settings', {
          model: workingModel
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (updateResponse.data.success) {
          console.log(`✅ Database updated to use: ${workingModel}`);
          console.log('\n🎯 AI Assistant should now work with the new model!');
        }
      }
    } catch (dbError) {
      console.log('⚠️  Could not update database, but working model found:', workingModel);
    }
  }
});