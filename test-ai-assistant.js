/**
 * Test AI Assistant
 * Quick test to verify AI assistant is working
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// You'll need to replace this with a real token from your app
// Get it by logging in and checking localStorage.getItem('token')
const TEST_TOKEN = 'YOUR_TOKEN_HERE';

async function testAI() {
  console.log('🧪 Testing AI Assistant...\n');
  
  try {
    // Test 1: Check status
    console.log('1️⃣ Checking AI status...');
    const statusResponse = await axios.get(`${API_URL}/api/ai/status`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    console.log('✅ Status:', statusResponse.data);
    console.log(`   Enabled: ${statusResponse.data.data.enabled ? '✅ YES' : '❌ NO'}`);
    console.log(`   Provider: ${statusResponse.data.data.provider}`);
    console.log(`   Daily usage: ${statusResponse.data.data.usage.dailyUsed}/${statusResponse.data.data.usage.dailyLimit}`);
    console.log(`   Hourly usage: ${statusResponse.data.data.usage.hourlyUsed}/${statusResponse.data.data.usage.hourlyLimit}\n`);
    
    // Test 2: Send a message
    console.log('2️⃣ Sending test message...');
    const chatResponse = await axios.post(
      `${API_URL}/api/ai/chat`,
      {
        message: 'How do I create an invoice?',
        context: { page: 'dashboard', test: true }
      },
      {
        headers: { 
          Authorization: `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ AI Response:');
    console.log(`   ${chatResponse.data.data.response}\n`);
    console.log(`   Provider: ${chatResponse.data.data.provider}`);
    console.log(`   Tokens used: ${chatResponse.data.data.tokensUsed}\n`);
    
    console.log('🎉 AI Assistant is working perfectly!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Tip: Update TEST_TOKEN in test-ai-assistant.js');
        console.log('   1. Login to your app');
        console.log('   2. Open browser console');
        console.log('   3. Run: localStorage.getItem("token")');
        console.log('   4. Copy the token and paste it in this script');
      }
    } else {
      console.error('❌ Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Tip: Make sure backend server is running');
        console.log('   cd backend && npm run dev');
      }
    }
  }
}

// Check if token is set
if (TEST_TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('⚠️  Please set TEST_TOKEN first!\n');
  console.log('How to get your token:');
  console.log('1. Login to your app (http://localhost:5173)');
  console.log('2. Open browser console (F12)');
  console.log('3. Run: localStorage.getItem("token")');
  console.log('4. Copy the token');
  console.log('5. Replace TEST_TOKEN in this file\n');
  console.log('Or test via browser console:');
  console.log(`
fetch('http://localhost:5000/api/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'How do I create an invoice?'
  })
}).then(r => r.json()).then(console.log)
  `);
} else {
  testAI();
}
