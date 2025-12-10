require('dotenv').config();

async function testGeminiAPIKey() {
  console.log('\n🔍 TESTING GEMINI API KEY');
  console.log('================================================================================');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ GEMINI_API_KEY found:', apiKey.substring(0, 10) + '...');
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    console.log('✅ Google Generative AI package loaded');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    console.log('✅ Gemini model initialized');
    
    console.log('\n🔄 Testing simple message...');
    const result = await model.generateContent('Hello, this is a test. Please respond with "Test successful".');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini Response:', text);
    
    console.log('\n🎯 GEMINI API TEST RESULT: SUCCESS');
    console.log('The API key is working correctly.');
    
  } catch (error) {
    console.log('\n❌ GEMINI API TEST FAILED');
    console.log('Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 SOLUTION: The API key is invalid or expired');
      console.log('1. Check if the API key is correct');
      console.log('2. Verify the API key has proper permissions');
      console.log('3. Check if billing is enabled for the Google Cloud project');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n💡 SOLUTION: Permission denied');
      console.log('1. Enable the Generative AI API in Google Cloud Console');
      console.log('2. Check billing is enabled');
      console.log('3. Verify API key permissions');
    } else {
      console.log('\n💡 SOLUTION: Check the error details above');
      console.log('Full error:', error);
    }
  }
}

testGeminiAPIKey();