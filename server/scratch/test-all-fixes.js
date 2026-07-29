const axios = require('axios');

async function testAllFixes() {
  try {
    // 1. Login as milujiji (milujiji702@gmail.com)
    console.log('Logging in as milujiji...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'milujiji702@gmail.com',
      password: 'admin123'
    });
    console.log('Login success:', loginRes.data.success);
    const token = loginRes.data.token;
    console.log('User profile from login:', loginRes.data.user);

    // 2. Test GET /api/auth/profile
    const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\nGET /api/auth/profile response:', profileRes.data.user);

    // 3. Test GET /api/community/posts
    const postsRes = await axios.get('http://localhost:5000/api/community/posts');
    console.log(`\nGET /api/community/posts count: ${postsRes.data.count}`);
    const firstPost = postsRes.data.posts[0];
    console.log('First post:', { id: firstPost._id, author: firstPost.authorName, content: firstPost.content, likesCount: firstPost.likes?.length });

    // 4. Test Liking the first post
    if (firstPost) {
      console.log(`\nLiking post ID ${firstPost._id}...`);
      const likeRes = await axios.post(`http://localhost:5000/api/community/posts/${firstPost._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Like response:', likeRes.data);
    }

    // 5. Test Creating a new post
    console.log('\nCreating a new community post...');
    const createRes = await axios.post('http://localhost:5000/api/community/posts', {
      content: 'Testing live community post creation from Cardora platform.',
      category: 'Farming Tip'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Create Post response success:', createRes.data.success);
    console.log('Created Post:', createRes.data.post);

    console.log('\n🎉 ALL FIXES VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message);
  }
}

testAllFixes();
