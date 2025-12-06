const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'test@test.com',
  password: 'TestPassword123!'
};

async function testIntegration() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ Login successful\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test 1: Get tasks
    console.log('📋 Fetching tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/tasks`, config);
    const tasks = tasksResponse.data.data || tasksResponse.data;
    console.log(`Found ${tasks.length} tasks`);
    
    if (tasks.length === 0) {
      console.log('⚠️  No tasks found. Please create a task first.');
      return;
    }

    const testTask = tasks[0];
    console.log(`Using task: "${testTask.title}" (ID: ${testTask.id})\n`);

    // Test 2: Start a timer for this task
    console.log('▶️  Starting timer for task...');
    const startResponse = await axios.post(`${BASE_URL}/time-tracking/start`, {
      task_id: testTask.id,
      description: `Working on ${testTask.title}`
    }, config);
    const timer = startResponse.data.data || startResponse.data;
    console.log('✅ Timer started:', timer.id);

    // Wait 5 seconds
    console.log('⏳ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 3: Stop the timer
    console.log('⏹️  Stopping timer...');
    await axios.post(`${BASE_URL}/time-tracking/${timer.id}/stop`, {}, config);
    console.log('✅ Timer stopped\n');

    // Test 4: Get task duration
    console.log('📊 Fetching task duration...');
    const durationResponse = await axios.get(`${BASE_URL}/time-tracking/duration/task/${testTask.id}`, config);
    const duration = durationResponse.data.data || durationResponse.data;
    
    console.log('✅ Task duration:', {
      minutes: duration.minutes,
      hours: duration.hours
    });

    if (duration.minutes > 0) {
      console.log('\n✅ SUCCESS: Time tracking data is available for invoicing!');
      console.log(`   When you select this task in an invoice with "hourly" billing,`);
      console.log(`   it will automatically load ${duration.hours} hours.`);
    } else {
      console.log('\n⚠️  No time tracked yet for this task.');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Integration test complete!');
    console.log('═══════════════════════════════════════');
    console.log('\nNext steps:');
    console.log('1. Go to Invoices page');
    console.log('2. Create a new invoice');
    console.log('3. Select "Hourly" billing type');
    console.log(`4. Select task: "${testTask.title}"`);
    console.log('5. Hours should auto-populate!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testIntegration();
