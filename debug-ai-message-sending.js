const axios = require('axios');

async function debugAIMessageSending() {
  console.log('\n🔍 DEBUGGING AI MESSAGE SENDING');
  console.log('================================================================================');
  
  const baseURL = 'http://localhost:5000/api';
  let authToken = null;

  try {
    // Step 1: Login to get auth token
    console.log('🔄 Step 1: Getting authentication token...');
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

    // Step 2: Test AI status
    console.log('\n🔄 Step 2: Checking AI status...');
    const statusResponse = await axios.get(`${baseURL}/ai/status`);
    console.log('✅ AI Status:', statusResponse.data);

    // Step 3: Test AI chat endpoint with authentication
    console.log('\n🔄 Step 3: Testing AI chat endpoint...');
    try {
      const chatResponse = await axios.post(`${baseURL}/ai/chat`, {
        message: 'Hello, this is a test message from the debug script'
      }, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Chat Response Status:', chatResponse.status);
      console.log('✅ Chat Response:', JSON.stringify(chatResponse.data, null, 2));

    } catch (chatError) {
      console.log('❌ Chat Error Details:');
      if (chatError.response) {
        console.log('   Status:', chatError.response.status);
        console.log('   Headers:', chatError.response.headers);
        console.log('   Data:', JSON.stringify(chatError.response.data, null, 2));
      } else {
        console.log('   Error:', chatError.message);
      }
    }

    // Step 4: Test without authentication (should fail)
    console.log('\n🔄 Step 4: Testing without authentication (should fail)...');
    try {
      const noAuthResponse = await axios.post(`${baseURL}/ai/chat`, {
        message: 'Test without auth'
      });
      console.log('⚠️  Unexpected: Chat worked without auth');
    } catch (noAuthError) {
      if (noAuthError.response?.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request');
      } else {
        console.log('❌ Unexpected error:', noAuthError.response?.status, noAuthError.response?.data);
      }
    }

    // Step 5: Check if user is logged in on frontend
    console.log('\n🔄 Step 5: Checking frontend authentication state...');
    console.log('💡 In browser console, check:');
    console.log('   localStorage.getItem("token")');
    console.log('   localStorage.getItem("user")');
    
    console.log('\n📊 DEBUGGING SUMMARY');
    console.log('================================================================================');
    console.log('If AI chat is not working in the frontend, check:');
    console.log('1. User is logged in (token in localStorage)');
    console.log('2. AI Assistant widget is visible');
    console.log('3. Browser console for JavaScript errors');
    console.log('4. Network tab for failed API requests');
    console.log('5. Backend logs for authentication errors');

  } catch (error) {
    console.error('\n❌ DEBUG FAILED');
    console.error('================================================================================');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

debugAIMessageSending();