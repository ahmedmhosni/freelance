/**
 * Test AI Assistant Live
 * Quick test to verify AI assistant is working
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAIAssistant() {
  console.log('🤖 Testing AI Assistant...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'TestPassword123!'
    });
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully');

    // Step 2: Check AI status
    console.log('\n2️⃣ Checking AI status...');
    const statusResponse = await axios.get(`${API_URL}/ai/status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ AI Status:', JSON.stringify(statusResponse.data, null, 2));

    if (!statusResponse.data.data.enabled) {
      console.log('❌ AI Assistant is disabled');
      return;
    }

    // Step 3: Send a test message to AI
    console.log('\n3️⃣ Sending message to AI...');
    const chatResponse = await axios.post(
      `${API_URL}/ai/chat`,
      {
        message: 'Hello! Can you help me understand how to create a new invoice?',
        context: {
          page: 'invoices',
          feature: 'invoice-creation'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ AI Response:');
    console.log('   Response:', chatResponse.data.response);
    console.log('   Tokens:', chatResponse.data.tokens);
    console.log('   Response Time:', chatResponse.data.responseTime, 'ms');
    console.log('   Provider:', chatResponse.data.provider);

    // Step 4: Check health
    console.log('\n4️⃣ Checking AI health...');
    const healthResponse = await axios.get(`${API_URL}/ai/health`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Health Check:', JSON.stringify(healthResponse.data, null, 2));

    console.log('\n✅ All tests passed! AI Assistant is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAIAssistant();
