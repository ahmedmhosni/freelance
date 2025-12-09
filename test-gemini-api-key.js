/**
 * Test Gemini API Key validity
 */

const axios = require('axios');

const API_KEY = 'AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8';

async function testAPIKey() {
  console.log('Testing Gemini API Key...\n');
  
  try {
    // Try to list models using REST API
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    console.log('✅ API Key is valid!\n');
    console.log('Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name}`);
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`  ✓ Supports generateContent`);
      }
    });
    
  } catch (error) {
    console.error('❌ API Key test failed');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    console.error('\nPossible issues:');
    console.error('1. API key is invalid or expired');
    console.error('2. Gemini API is not enabled');
    console.error('3. API key restrictions (IP, referrer, etc.)');
    console.error('\nPlease generate a new API key at:');
    console.error('https://makersuite.google.com/app/apikey');
  }
}

testAPIKey();
