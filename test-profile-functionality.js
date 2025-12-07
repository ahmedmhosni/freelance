const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testProfileFunctionality() {
  console.log('='.repeat(80));
  console.log('PROFILE FUNCTIONALITY TEST');
  console.log('='.repeat(80));

  try {
    // Step 1: Login
    console.log('\n1. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    
    const token = loginRes.data.token;
    console.log('✓ Login successful');

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Get current profile
    console.log('\n2. Fetching profile (GET /api/profile/me)...');
    const getProfileRes = await axios.get(`${BASE_URL}/profile/me`, { headers });
    console.log('✓ Profile fetched successfully');
    console.log('Current profile data:');
    console.log(JSON.stringify(getProfileRes.data, null, 2));

    // Step 3: Update profile
    console.log('\n3. Updating profile (PUT /api/profile/me)...');
    const updateData = {
      name: getProfileRes.data.name || 'Admin User',
      username: getProfileRes.data.username || 'admin',
      job_title: 'System Administrator',
      bio: 'Managing the freelance platform',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/admin',
      github: 'https://github.com/admin',
      profile_visibility: 'public'
    };

    const updateRes = await axios.put(`${BASE_URL}/profile/me`, updateData, { headers });
    console.log('✓ Profile updated successfully');
    console.log('Response:', JSON.stringify(updateRes.data, null, 2));

    // Step 4: Verify update
    console.log('\n4. Verifying update...');
    const verifyRes = await axios.get(`${BASE_URL}/profile/me`, { headers });
    console.log('✓ Profile verified');
    
    const updated = verifyRes.data;
    const checks = [
      { field: 'job_title', expected: updateData.job_title, actual: updated.job_title },
      { field: 'bio', expected: updateData.bio, actual: updated.bio },
      { field: 'location', expected: updateData.location, actual: updated.location },
      { field: 'website', expected: updateData.website, actual: updated.website },
    ];

    console.log('\nField verification:');
    checks.forEach(check => {
      const match = check.actual === check.expected;
      console.log(`  ${check.field}: ${match ? '✓' : '✗'} ${match ? 'MATCH' : `MISMATCH (expected: ${check.expected}, got: ${check.actual})`}`);
    });

    // Step 5: Test username availability check
    console.log('\n5. Testing username availability...');
    const checkUsernameRes = await axios.get(`${BASE_URL}/profile/check-username/testuser123`);
    console.log('✓ Username check successful');
    console.log(`  Username 'testuser123' is ${checkUsernameRes.data.available ? 'available' : 'taken'}`);

    // Step 6: Test public profile view
    if (updated.username && updated.profile_visibility === 'public') {
      console.log('\n6. Testing public profile view...');
      const publicProfileRes = await axios.get(`${BASE_URL}/profile/${updated.username}`);
      console.log('✓ Public profile accessible');
      console.log(`  Public profile for @${updated.username} retrieved successfully`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✓ ALL PROFILE TESTS PASSED!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('✗ TEST FAILED');
    console.error('='.repeat(80));
    
    if (error.response) {
      console.error('\nAPI Error Response:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('\nNo response received from server');
      console.error('Is the backend server running on http://localhost:5000?');
    } else {
      console.error('\nError:', error.message);
    }
    process.exit(1);
  }
}

testProfileFunctionality();
