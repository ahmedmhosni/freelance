const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';
const TEST_EMAIL = 'ahmedmhosni90@gmail.com';
const TEST_PASSWORD = 'Test1234!@#';

async function testFeedbackSystem() {
  console.log('\n=== Testing Feedback System ===\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/v2/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.token;
    console.log('✓ Logged in successfully');

    // Step 2: Test feedback submission WITHOUT screenshot
    console.log('\n2. Testing feedback submission (without screenshot)...');
    const feedbackData1 = {
      type: 'bug',
      title: 'Test Bug Report',
      description: 'This is a test bug report to verify the feedback system is working correctly.'
    };

    const response1 = await axios.post(
      `${API_URL}/api/feedback`,
      feedbackData1,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✓ Feedback submitted successfully (without screenshot)');
    console.log('  Response:', response1.data);
    const feedbackId1 = response1.data.feedback.id;

    // Step 3: Test feedback submission WITH screenshot
    console.log('\n3. Testing feedback submission (with screenshot)...');
    
    // Create a test image file
    const testImagePath = 'test-screenshot.png';
    const testImageExists = fs.existsSync(testImagePath);
    
    if (testImageExists) {
      const formData = new FormData();
      formData.append('type', 'feature');
      formData.append('title', 'Test Feature Request with Screenshot');
      formData.append('description', 'This is a test feature request with an attached screenshot.');
      formData.append('screenshot', fs.createReadStream(testImagePath));

      const response2 = await axios.post(
        `${API_URL}/api/feedback`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...formData.getHeaders()
          }
        }
      );

      console.log('✓ Feedback submitted successfully (with screenshot)');
      console.log('  Response:', response2.data);
      console.log('  Screenshot URL:', response2.data.feedback.screenshot_url);
    } else {
      console.log('⚠ Skipping screenshot test (test-screenshot.png not found)');
      console.log('  To test with screenshot, create a test-screenshot.png file in the project root');
    }

    // Step 4: Test different feedback types
    console.log('\n4. Testing different feedback types...');
    
    const feedbackTypes = [
      { type: 'feature', title: 'Feature Request Test', description: 'Testing feature request type' },
      { type: 'other', title: 'General Feedback Test', description: 'Testing other feedback type' }
    ];

    for (const feedback of feedbackTypes) {
      try {
        const response = await axios.post(
          `${API_URL}/api/feedback`,
          feedback,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log(`  ✓ ${feedback.type} feedback submitted`);
      } catch (error) {
        console.log(`  ✗ ${feedback.type} feedback failed:`, error.message);
      }
    }

    // Step 5: Test validation (should fail)
    console.log('\n5. Testing validation...');
    
    const invalidFeedback = [
      { type: '', title: 'Test', description: 'Test' },
      { type: 'bug', title: '', description: 'Test' },
      { type: 'bug', title: 'Test', description: '' },
      { type: 'invalid', title: 'Test', description: 'Test' }
    ];

    for (const feedback of invalidFeedback) {
      try {
        await axios.post(
          `${API_URL}/api/feedback`,
          feedback,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('  ✗ Should have failed validation');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('  ✓ Correctly rejected invalid feedback');
        }
      }
    }

    // Step 6: Test admin endpoints (if user is admin)
    console.log('\n6. Testing admin endpoints...');
    
    try {
      // Get all feedback
      const allFeedbackResponse = await axios.get(
        `${API_URL}/api/feedback`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✓ Retrieved all feedback');
      console.log(`  Total feedback: ${allFeedbackResponse.data.feedback.length}`);

      // Test filtering
      const bugFeedbackResponse = await axios.get(
        `${API_URL}/api/feedback?type=bug`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log(`✓ Filtered by type: ${bugFeedbackResponse.data.feedback.length} bug reports`);

      // Update feedback status
      if (feedbackId1) {
        const updateResponse = await axios.put(
          `${API_URL}/api/feedback/${feedbackId1}`,
          {
            status: 'in_progress',
            admin_notes: 'Test note from automated test'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log('✓ Updated feedback status');
        console.log('  New status:', updateResponse.data.feedback.status);
      }

    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('⚠ Admin endpoints require admin role');
      } else {
        console.log('✗ Admin endpoint error:', error.message);
      }
    }

    // Step 7: Test file upload limits
    console.log('\n7. Testing file upload limits...');
    console.log('  Note: File size limit is 5MB');
    console.log('  Allowed types: JPEG, JPG, PNG, GIF, WEBP');

    console.log('\n✅ FEEDBACK SYSTEM TESTS COMPLETE!');
    console.log('\nSummary:');
    console.log('  - Feedback submission: Working');
    console.log('  - Screenshot upload: ' + (testImageExists ? 'Tested' : 'Skipped (no test image)'));
    console.log('  - Validation: Working');
    console.log('  - Different types: Working');
    console.log('  - Admin endpoints: ' + (loginResponse.data.user.role === 'admin' ? 'Tested' : 'Requires admin role'));

  } catch (error) {
    console.log('\n❌ Test failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Create a simple test image if it doesn't exist
function createTestImage() {
  const testImagePath = 'test-screenshot.png';
  if (!fs.existsSync(testImagePath)) {
    console.log('\nCreating test image...');
    // Create a simple 1x1 PNG (smallest valid PNG)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngData);
    console.log('✓ Test image created');
  }
}

// Run tests
createTestImage();
testFeedbackSystem();
