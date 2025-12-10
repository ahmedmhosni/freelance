const axios = require('axios');

async function debugAIButtonVisibility() {
  console.log('\n🔍 DEBUGGING AI ASSISTANT BUTTON VISIBILITY');
  console.log('================================================================================');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Step 1: Check if AI is enabled (public endpoint)
    console.log('🔄 Step 1: Checking AI status (public endpoint)...');
    const statusResponse = await axios.get(`${baseURL}/ai/status`);
    console.log('✅ AI Status Response:', JSON.stringify(statusResponse.data, null, 2));
    
    if (!statusResponse.data.enabled) {
      console.log('❌ AI IS DISABLED - This is why the button is not showing!');
      console.log('💡 Solution: Enable AI in admin settings');
      return;
    }
    
    // Step 2: Check frontend accessibility
    console.log('\n🔄 Step 2: Checking frontend accessibility...');
    const frontendResponse = await axios.get('http://localhost:3000');
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend is accessible');
    }
    
    // Step 3: Check if user needs to be logged in
    console.log('\n🔄 Step 3: Testing with authentication...');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'admin@roastify.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Admin login works');
        console.log('💡 Try logging in as admin to see the AI button');
      }
    } catch (loginError) {
      console.log('⚠️  Admin login failed - create admin user first');
    }
    
    console.log('\n📊 BUTTON VISIBILITY CHECKLIST');
    console.log('================================================================================');
    console.log('For the AI Assistant button to show, you need:');
    console.log('1. ✅ AI enabled in settings (checked above)');
    console.log('2. 🔄 User logged in (try logging in)');
    console.log('3. 🔄 Frontend loaded without errors (check browser console)');
    console.log('4. 🔄 No CSS/positioning issues');
    
    console.log('\n🔧 TROUBLESHOOTING STEPS');
    console.log('================================================================================');
    console.log('1. Open http://localhost:3000 in browser');
    console.log('2. Open browser Developer Tools (F12)');
    console.log('3. Check Console tab for JavaScript errors');
    console.log('4. Log in with: admin@roastify.com / admin123');
    console.log('5. Look for AI button in bottom-right corner');
    console.log('6. If still not visible, check Elements tab for the button');
    
  } catch (error) {
    console.error('\n❌ DEBUG FAILED');
    console.error('================================================================================');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

debugAIButtonVisibility();