const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testProfile() {
  try {
    console.log('1. Testing login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    
    const token = loginRes.data.token;
    console.log('✓ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');

    console.log('\n2. Testing GET /api/profile/me...');
    const profileRes = await axios.get(`${BASE_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Profile fetched successfully');
    console.log('Profile data:', JSON.stringify(profileRes.data, null, 2));

    console.log('\n3. Testing PUT /api/profile/me...');
    const updateData = {
      name: profileRes.data.name,
      username: profileRes.data.username || 'admin',
      job_title: 'System Administrator',
      bio: 'Testing profile update',
      location: 'New York, USA',
      website: 'https://example.com',
      profile_visibility: 'public'
    };

    const updateRes = await axios.put(`${BASE_URL}/profile/me`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Profile updated successfully');
    console.log('Updated profile:', JSON.stringify(updateRes.data, null, 2));

    console.log('\n✓ All profile tests passed!');

  } catch (error) {
    console.error('\n✗ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProfile();
