/**
 * Test Gemini API directly
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8';

async function testGemini() {
  console.log('Testing Gemini API directly...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try different model names
    const modelNames = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'models/gemini-pro',
      'models/gemini-1.5-pro'
    ];
    
    for (const modelName of modelNames) {
      console.log(`\nTrying model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ SUCCESS with ${modelName}`);
        console.log(`Response: ${text}`);
        break;
      } catch (error) {
        console.log(`❌ FAILED with ${modelName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGemini();
