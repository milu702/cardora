const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function testPostCreation() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  // Get user milu
  const miluUser = await db.collection('users').findOne({ email: 'milujiji2027@mca.ajce.in' });
  const adminUser = await db.collection('users').findOne({ email: 'admin@cardora.io' });

  if (miluUser) {
    await db.collection('communityposts').insertOne({
      user: miluUser._id,
      userId: miluUser._id.toString(),
      username: miluUser.username || 'milu',
      authorName: miluUser.name || 'milu',
      authorAvatar: miluUser.profilePhoto || miluUser.avatar || '',
      content: 'High altitude canopy shading is improving cardamom tiller growth in my plot.',
      description: 'High altitude canopy shading is improving cardamom tiller growth in my plot.',
      category: 'Plantation Update',
      images: [],
      likes: [],
      comments: [],
      shares: 0,
      savedBy: [],
      reports: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });
    console.log('✅ Created post for user milu in Atlas');
  }

  if (adminUser) {
    await db.collection('communityposts').insertOne({
      user: adminUser._id,
      userId: adminUser._id.toString(),
      username: adminUser.username || 'admin_planter',
      authorName: adminUser.name || 'Cardora Planter Admin',
      authorAvatar: adminUser.profilePhoto || adminUser.avatar || '',
      content: 'Official Cardora Agronomic Advisory: Ensure 1% Bordeaux mixture soil drenching after heavy monsoon showers.',
      description: 'Official Cardora Agronomic Advisory: Ensure 1% Bordeaux mixture soil drenching after heavy monsoon showers.',
      category: 'Disease Diagnostics',
      images: [],
      likes: [],
      comments: [],
      shares: 0,
      savedBy: [],
      reports: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });
    console.log('✅ Created post for user Cardora Planter Admin in Atlas');
  }

  await conn.close();

  // Now test GET /api/community/posts
  const res = await axios.get('http://localhost:5000/api/community/posts');
  console.log(`\nGET /api/community/posts returned ${res.data.count} posts:`);
  for (const p of res.data.posts) {
    console.log(`- Author: ${p.authorName} (@${p.username}) | Content: "${p.content}"`);
  }
}

testPostCreation().catch(e => console.error(e));
