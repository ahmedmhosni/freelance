const axios = require('axios');

async function verifyAIButtonVisible() {
  console.log('\n🔍 VERIFYING AI BUTTON VISIBILITY');
  console.log('================================================================================');
  
  try {
    // Check AI status
    console.log('🔄 Checking AI status...');
    const statusResponse = await axios.get('http://localhost:5000/api/ai/status');
    
    if (statusResponse.data.enabled) {
      console.log('✅ AI is ENABLED - Button should be visible');
      
      // Check frontend
      console.log('\n🔄 Checking frontend...');
      const frontendResponse = await axios.get('http://localhost:3000');
      
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend is accessible');
        
        console.log('\n🎯 AI ASSISTANT BUTTON STATUS');
        console.log('================================================================================');
        console.log('✅ AI Status: ENABLED');
        console.log('✅ Frontend: ACCESSIBLE');
        console.log('✅ Button: SHOULD BE VISIBLE');
        
        console.log('\n📍 BUTTON LOCATION:');
        console.log('- Position: Bottom-right corner');
        console.log('- Style: Circular button with robot icon');
        console.log('- Color: Purple gradient background');
        console.log('- Size: 56px diameter');
        console.log('- Location: 90px from bottom, 20px from right');
        
        console.log('\n🔧 IF YOU STILL CAN\'T SEE THE BUTTON:');
        console.log('1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)');
        console.log('2. Clear browser cache');
        console.log('3. Check browser console for errors (F12)');
        console.log('4. Make sure you\'re logged in');
        console.log('5. Try different browser');
        
        console.log('\n💡 BROWSER CONSOLE CHECK:');
        console.log('Open Developer Tools (F12) and look for:');
        console.log('- JavaScript errors in Console tab');
        console.log('- AI Assistant component in Elements tab');
        console.log('- Network requests to /api/ai/status');
        
      } else {
        console.log('❌ Frontend not accessible');
      }
      
    } else {
      console.log('❌ AI is DISABLED - Button will not show');
      console.log('Run: node enable-ai-assistant.js');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyAIButtonVisible();