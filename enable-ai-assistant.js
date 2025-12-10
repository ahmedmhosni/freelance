const axios = require('axios');

async function enableAIAssistant() {
  console.log('\n🔧 ENABLING AI ASSISTANT');
  console.log('================================================================================');
  
  const baseURL = 'http://localhost:5000/api';
  let authToken = null;

  try {
    // Step 1: Login as admin
    console.log('🔄 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@roastify.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      authToken = loginResponse.data.token;
      console.log('✅ Admin login successful');
    } else {
      throw new Error('Admin login failed');
    }

    // Step 2: Get current AI settings
    console.log('\n🔄 Step 2: Getting current AI settings...');
    const currentSettings = await axios.get(`${baseURL}/ai/admin/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Current settings:', {
      enabled: currentSettings.data.data.enabled,
      provider: currentSettings.data.data.provider,
      model: currentSettings.data.data.model
    });

    // Step 3: Enable AI
    console.log('\n🔄 Step 3: Enabling AI Assistant...');
    const updateResponse = await axios.put(`${baseURL}/ai/admin/settings`, {
      enabled: true,
      provider: 'gemini',
      model: 'gemini-2.0-flash'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (updateResponse.data.success) {
      console.log('✅ AI Assistant enabled successfully!');
      console.log('New settings:', {
        enabled: updateResponse.data.data.enabled,
        provider: updateResponse.data.data.provider,
        model: updateResponse.data.data.model
      });
    }

    // Step 4: Verify AI status
    console.log('\n🔄 Step 4: Verifying AI status...');
    const statusResponse = await axios.get(`${baseURL}/ai/status`);
    console.log('✅ AI Status:', statusResponse.data);

    if (statusResponse.data.enabled) {
      console.log('\n🎉 SUCCESS! AI ASSISTANT IS NOW ENABLED');
      console.log('================================================================================');
      console.log('✅ AI Assistant button should now be visible');
      console.log('✅ Located in bottom-right corner of the page');
      console.log('✅ Positioned above the feedback button');
      
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Refresh your browser at http://localhost:3000');
      console.log('2. Log in if not already logged in');
      console.log('3. Look for the AI Assistant button (robot icon)');
      console.log('4. Click it to open the chat widget');
      
      console.log('\n⚠️  NOTE: Messages won\'t work until API key is replaced');
      console.log('But the button and widget should be visible and functional');
      
    } else {
      console.log('❌ AI is still disabled after update');
    }

  } catch (error) {
    console.error('\n❌ ENABLE FAILED');
    console.error('================================================================================');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

enableAIAssistant();