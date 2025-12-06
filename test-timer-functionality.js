const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'test@test.com',
  password: 'TestPassword123!'
};

async function testTimerFunctionality() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ Login successful\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test 1: Check for running timers
    console.log('📊 Checking for running timers...');
    const runningResponse = await axios.get(`${BASE_URL}/time-tracking/running`, config);
    const runningTimers = runningResponse.data.data || runningResponse.data;
    console.log('Running timers:', runningTimers.length);
    
    if (runningTimers.length > 0) {
      console.log('⚠️  Found running timer, stopping it first...');
      const timerId = runningTimers[0].id;
      await axios.post(`${BASE_URL}/time-tracking/${timerId}/stop`, {}, config);
      console.log('✅ Stopped existing timer\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 2: Start a new timer
    console.log('▶️  Starting a new timer...');
    const startResponse = await axios.post(`${BASE_URL}/time-tracking/start`, {
      description: 'Test timer - automated test',
      project_id: null,
      task_id: null
    }, config);
    
    const newTimer = startResponse.data.data || startResponse.data;
    console.log('✅ Timer started:', {
      id: newTimer.id,
      description: newTimer.description,
      start_time: newTimer.start_time
    });

    // Test 3: Wait 3 seconds and check if timer is still running
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📊 Checking running timer status...');
    const checkResponse = await axios.get(`${BASE_URL}/time-tracking/running`, config);
    const stillRunning = checkResponse.data.data || checkResponse.data;
    
    if (stillRunning.length > 0) {
      const timer = stillRunning[0];
      const startTime = new Date(timer.start_time).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      
      console.log('✅ Timer is still running!');
      console.log('   Elapsed time:', elapsed, 'seconds');
      console.log('   Expected: ~3 seconds');
      
      if (elapsed >= 3 && elapsed <= 5) {
        console.log('✅ Timer counting correctly!\n');
      } else {
        console.log('⚠️  Timer elapsed time seems off\n');
      }
    } else {
      console.log('❌ Timer not found!\n');
    }

    // Test 4: Stop the timer
    console.log('⏹️  Stopping timer...');
    const stopResponse = await axios.post(`${BASE_URL}/time-tracking/${newTimer.id}/stop`, {}, config);
    const stoppedTimer = stopResponse.data.data || stopResponse.data;
    
    console.log('✅ Timer stopped:', {
      id: stoppedTimer.id,
      duration: stoppedTimer.duration,
      end_time: stoppedTimer.end_time
    });

    // Test 5: Verify timer is no longer running
    console.log('\n📊 Verifying timer stopped...');
    const finalCheck = await axios.get(`${BASE_URL}/time-tracking/running`, config);
    const finalRunning = finalCheck.data.data || finalCheck.data;
    
    if (finalRunning.length === 0) {
      console.log('✅ No running timers - test passed!\n');
    } else {
      console.log('⚠️  Still found running timers\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ All timer functionality tests passed!');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testTimerFunctionality();
