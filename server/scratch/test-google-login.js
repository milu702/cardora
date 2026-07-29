const axios = require('axios');

async function testGoogleLogin() {
  try {
    console.log('Testing Google Login API endpoint...');
    const res = await axios.post('http://localhost:5000/api/auth/google-login', {
      name: 'Milu Jiji Google Test',
      email: 'milujiji702@gmail.com',
      googleId: 'google_1785045582717',
      profilePhoto: 'https://lh3.googleusercontent.com/a/default-user',
    });

    console.log('✅ Google Login API Success:', res.data.success);
    console.log('Token received:', res.data.token ? 'Yes' : 'No');
    console.log('User data returned:', res.data.user);
  } catch (err) {
    console.error('❌ Google Login Error:', err.response?.data || err.message);
  }
}

testGoogleLogin();
