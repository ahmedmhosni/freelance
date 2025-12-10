require('dotenv').config({ path: './backend/.env' });

async function listAvailableModels() {
  console.log('\n🔍 LISTING AVAILABLE GEMINI MODELS');
  console.log('================================================================================');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found');
    return;
  }
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('🔄 Fetching available models...');
    
    // List models
    const models = await genAI.listModels();
    
    console.log('\n✅ Available Models:');
    console.log('================================================================================');
    
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
    
    // Find models that support generateContent
    const contentModels = models.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    );
    
    console.log('\n🎯 RECOMMENDED MODELS FOR CHAT:');
    console.log('================================================================================');
    contentModels.forEach((model, index) => {
      const modelName = model.name.replace('models/', '');
      console.log(`${index + 1}. ${modelName}`);
      console.log(`   Display Name: ${model.displayName}`);
    });
    
  } catch (error) {
    console.log('\n❌ FAILED TO LIST MODELS');
    console.log('Error:', error.message);
    
    if (error.status === 429) {
      console.log('\n💡 QUOTA EXCEEDED - Using known working models:');
      console.log('================================================================================');
      console.log('1. gemini-pro');
      console.log('2. gemini-1.5-pro');
      console.log('3. gemini-1.5-flash-latest');
      console.log('4. gemini-2.0-flash-exp (if available)');
    }
  }
}

listAvailableModels();