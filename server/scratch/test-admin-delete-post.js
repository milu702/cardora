const axios = require('axios');

async function testAdminDeletePost() {
  try {
    // 1. Login as Admin (admin@cardora.com)
    console.log('Logging in as System Administrator...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@cardora.com',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('Admin logged in! Token acquired.');

    // 2. Create a test post to delete
    console.log('Creating test post...');
    const createRes = await axios.post('http://localhost:5000/api/community/posts', {
      content: 'Temporary post to test admin post deletion privileges.',
      category: 'Plantation Update'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const testPostId = createRes.data.post._id;
    console.log(`Created test post ID: ${testPostId}`);

    // 3. Admin deletes post
    console.log(`Admin deleting post ID: ${testPostId}...`);
    const deleteRes = await axios.delete(`http://localhost:5000/api/community/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Admin Delete Response:', deleteRes.data);
    console.log('🎉 ADMIN POST DELETION TEST PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testAdminDeletePost();
