const axios = require('axios');

async function updateAIModelSetting() {
  console.log('\n🔧 UPDATING AI MODEL SETTING');
  console.log('================================================================================');
  
  const baseURL = 'http://localhost:5000/api';
  let authToken = null;

  try {
    // Step 1: Login
    console.log('🔄 Step 1: Authenticating...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@roastify.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      authToken = loginResponse.data.token;
      console.log('✅ Authentication successful');
    } else {
      throw new Error('Login failed');
    }

    // Step 2: Get current settings
    console.log('\n🔄 Step 2: Getting current AI settings...');
    const currentSettings = await axios.get(`${baseURL}/ai/admin/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Current model:', currentSettings.data.data.model);

    // Step 3: Update model to gemini-1.5-flash
    console.log('\n🔄 Step 3: Updating model to gemini-1.5-flash...');
    const updateResponse = await axios.put(`${baseURL}/ai/admin/settings`, {
      model: 'gemini-1.5-flash'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (updateResponse.data.success) {
      console.log('✅ Model updated successfully');
      console.log('✅ New model:', updateResponse.data.data.model);
    } else {
      console.log('❌ Failed to update model:', updateResponse.data.error);
    }

    // Step 4: Test AI with new model
    console.log('\n🔄 Step 4: Testing AI with new model...');
    const chatResponse = await axios.post(`${baseURL}/ai/chat`, {
      message: 'Hello! Please respond with "New model working" to confirm.'
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: 15000
    });

    if (chatResponse.data.success) {
      console.log('✅ AI Response:', chatResponse.data.data.response);
      console.log('\n🎯 SUCCESS! AI is working with the new model');
    } else {
      console.log('❌ AI still not working:', chatResponse.data.error);
    }

  } catch (error) {
    console.log('\n❌ UPDATE FAILED');
    console.log('================================================================================');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

updateAIModelSetting();