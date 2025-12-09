/**
 * List available Gemini models
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8';

async function listModels() {
  console.log('Listing available Gemini models...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('Available models:');
    for (const model of models) {
      console.log(`- ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error listing models:', error.message);
    console.error('\nThis might mean:');
    console.error('1. The API key is invalid or expired');
    console.error('2. The Gemini API is not enabled for this project');
    console.error('3. There are billing or quota issues');
    console.error('\nPlease check:');
    console.error('- https://makersuite.google.com/app/apikey');
    console.error('- https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
  }
}

listModels();
