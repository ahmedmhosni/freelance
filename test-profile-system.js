require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const status = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${status} ${name}`, color);
  if (details) log(`  ${details}`, 'cyan');
  
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testProfileSystem() {
  log('\n🧪 Testing Profile System\n', 'blue');
  log('='.repeat(60), 'blue');

  let token = null;
  let userId = null;
  let username = null;

  try {
    // Test 1: Create test user
    log('\n📝 Test 1: Create Test User', 'yellow');
    try {
      const registerData = {
        name: 'Profile Test User',
        email: `profiletest${Date.now()}@test.com`,
        password: 'Test123!@#'
      };

      const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
      token = registerResponse.data.token;
      userId = registerResponse.data.user.id;
      username = registerResponse.data.user.username || registerResponse.data.user.email.split('@')[0];

      logTest('User registration', true, `User ID: ${userId}`);
    } catch (error) {
      logTest('User registration', false, error.response?.data?.message || error.message);
      return;
    }

    // Test 2: Get current user profile
    log('\n📝 Test 2: Get Current User Profile', 'yellow');
    try {
      const profileResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const profile = profileResponse.data;
      logTest('Get profile', true, `Name: ${profile.name}, Email: ${profile.email}`);
      
      // Verify profile fields exist
      const hasRequiredFields = profile.hasOwnProperty('name') && 
                               profile.hasOwnProperty('email') &&
                               profile.hasOwnProperty('username');
      logTest('Profile has required fields', hasRequiredFields);
    } catch (error) {
      logTest('Get profile', false, error.response?.data?.message || error.message);
    }

    // Test 3: Update profile with basic info
    log('\n📝 Test 3: Update Profile - Basic Info', 'yellow');
    try {
      const updateData = {
        name: 'Updated Profile Test',
        username: `testuser${Date.now()}`,
        job_title: 'Freelance Designer',
        bio: 'This is a test bio for profile testing. I love creating amazing designs!',
        location: 'New York, USA'
      };

      const updateResponse = await axios.put(`${API_URL}/profile/me`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      username = updateData.username; // Update username for later tests
      logTest('Update basic info', true, `Job: ${updateData.job_title}`);
      
      // Verify update
      const verifyResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updated = verifyResponse.data;
      const isUpdated = updated.job_title === updateData.job_title &&
                       updated.bio === updateData.bio &&
                       updated.location === updateData.location;
      
      logTest('Verify profile update', isUpdated, `Bio length: ${updated.bio?.length || 0} chars`);
    } catch (error) {
      logTest('Update basic info', false, error.response?.data?.message || error.message);
    }

    // Test 4: Update profile with social links
    log('\n📝 Test 4: Update Profile - Social Links', 'yellow');
    try {
      const socialData = {
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/testuser',
        twitter: 'https://twitter.com/testuser',
        github: 'https://github.com/testuser',
        behance: 'https://behance.net/testuser',
        dribbble: 'https://dribbble.com/testuser',
        portfolio: 'https://portfolio.example.com'
      };

      await axios.put(`${API_URL}/profile/me`, socialData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      logTest('Update social links', true, `Added ${Object.keys(socialData).length} social links`);
      
      // Verify social links
      const verifyResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile = verifyResponse.data;
      const hasAllLinks = Object.keys(socialData).every(key => profile[key] === socialData[key]);
      
      logTest('Verify social links', hasAllLinks, `Website: ${profile.website}`);
    } catch (error) {
      logTest('Update social links', false, error.response?.data?.message || error.message);
    }

    // Test 5: Update profile visibility
    log('\n📝 Test 5: Profile Visibility Settings', 'yellow');
    try {
      // Set to public
      await axios.put(`${API_URL}/profile/me`, { profile_visibility: 'public' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let profileResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logTest('Set profile to public', profileResponse.data.profile_visibility === 'public');
      
      // Set to private
      await axios.put(`${API_URL}/profile/me`, { profile_visibility: 'private' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      profileResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logTest('Set profile to private', profileResponse.data.profile_visibility === 'private');
      
      // Set back to public for public profile test
      await axios.put(`${API_URL}/profile/me`, { profile_visibility: 'public' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      logTest('Profile visibility', false, error.response?.data?.message || error.message);
    }

    // Test 6: Set profile picture (avatar URL)
    log('\n📝 Test 6: Profile Picture', 'yellow');
    try {
      const avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4';
      
      await axios.put(`${API_URL}/profile/me`, { profile_picture: avatarUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profileResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logTest('Set profile picture', profileResponse.data.profile_picture === avatarUrl, 'Avatar URL set');
    } catch (error) {
      logTest('Set profile picture', false, error.response?.data?.message || error.message);
    }

    // Test 7: Get public profile by username
    log('\n📝 Test 7: Public Profile Access', 'yellow');
    try {
      const publicResponse = await axios.get(`${API_URL}/profile/${username}`);
      
      const publicProfile = publicResponse.data;
      logTest('Get public profile', true, `Username: ${publicProfile.username}`);
      
      // Verify public profile has necessary fields
      const hasPublicFields = publicProfile.hasOwnProperty('name') &&
                             publicProfile.hasOwnProperty('job_title') &&
                             publicProfile.hasOwnProperty('bio') &&
                             !publicProfile.hasOwnProperty('email'); // Email should not be public
      
      logTest('Public profile fields correct', hasPublicFields, 'Email hidden, public info visible');
    } catch (error) {
      logTest('Get public profile', false, error.response?.data?.message || error.message);
    }

    // Test 8: Try to access private profile
    log('\n📝 Test 8: Private Profile Protection', 'yellow');
    try {
      // Set profile to private
      await axios.put(`${API_URL}/profile/me`, { profile_visibility: 'private' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Try to access public profile (should fail or return limited info)
      try {
        await axios.get(`${API_URL}/profile/${username}`);
        logTest('Private profile protection', false, 'Private profile was accessible');
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          logTest('Private profile protection', true, 'Private profile correctly blocked');
        } else {
          logTest('Private profile protection', false, `Unexpected error: ${error.response?.status}`);
        }
      }
    } catch (error) {
      logTest('Private profile protection', false, error.response?.data?.message || error.message);
    }

    // Test 9: Username validation
    log('\n📝 Test 9: Username Validation', 'yellow');
    try {
      // Try invalid username (with spaces)
      try {
        await axios.put(`${API_URL}/profile/me`, { username: 'invalid username' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        logTest('Username validation (spaces)', false, 'Accepted invalid username with spaces');
      } catch (error) {
        if (error.response?.status === 400) {
          logTest('Username validation (spaces)', true, 'Rejected username with spaces');
        } else {
          logTest('Username validation (spaces)', false, `Unexpected error: ${error.response?.status}`);
        }
      }
      
      // Try invalid username (special characters)
      try {
        await axios.put(`${API_URL}/profile/me`, { username: 'test@user!' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        logTest('Username validation (special chars)', false, 'Accepted invalid username with special chars');
      } catch (error) {
        if (error.response?.status === 400) {
          logTest('Username validation (special chars)', true, 'Rejected username with special chars');
        } else {
          logTest('Username validation (special chars)', false, `Unexpected error: ${error.response?.status}`);
        }
      }
    } catch (error) {
      logTest('Username validation', false, error.message);
    }

    // Test 10: Profile completeness
    log('\n📝 Test 10: Profile Completeness Check', 'yellow');
    try {
      const profileResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile = profileResponse.data;
      const completenessFields = [
        'name', 'username', 'job_title', 'bio', 'location', 
        'profile_picture', 'website'
      ];
      
      const filledFields = completenessFields.filter(field => profile[field]);
      const completeness = Math.round((filledFields.length / completenessFields.length) * 100);
      
      logTest('Profile completeness', true, `${completeness}% complete (${filledFields.length}/${completenessFields.length} fields)`);
    } catch (error) {
      logTest('Profile completeness', false, error.response?.data?.message || error.message);
    }

  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
  }

  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log('\n📊 Test Summary\n', 'blue');
  log(`Total Tests: ${testResults.passed + testResults.failed}`);
  log(`✓ Passed: ${testResults.passed}`, 'green');
  log(`✗ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%\n`);

  if (testResults.failed > 0) {
    log('Failed Tests:', 'red');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => log(`  - ${t.name}: ${t.details}`, 'red'));
  }

  log('\n' + '='.repeat(60), 'blue');
  
  if (testResults.failed === 0) {
    log('\n🎉 All profile tests passed! Profile system is working correctly.\n', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.\n', 'yellow');
  }
}

// Run tests
testProfileSystem().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
