const axios = require('axios');

async function testNewGoogleUser() {
  try {
    const testEmail = `planter_${Date.now()}@gmail.com`;
    console.log(`Testing new Google Sign-Up for: ${testEmail}`);

    const res = await axios.post('http://localhost:5000/api/auth/google-login', {
      name: 'Anu Varghese',
      email: testEmail,
      googleId: `google_id_${Date.now()}`,
      profilePhoto: 'https://lh3.googleusercontent.com/a/test-photo',
    });

    console.log('✅ Google Sign-Up Success:', res.data.success);
    console.log('New User Details:', {
      id: res.data.user.id,
      name: res.data.user.name,
      username: res.data.user.username,
      email: res.data.user.email,
      role: res.data.user.role,
    });
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testNewGoogleUser();
