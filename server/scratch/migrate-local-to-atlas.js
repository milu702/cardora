const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const localUri = 'mongodb://127.0.0.1:27017/cardora';

async function migrate() {
  console.log('Connecting to Local Mongo & Atlas Mongo...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();

  console.log('Connected!');

  const localDb = localConn.db;
  const atlasDb = atlasConn.db;

  // 1. Fetch all community posts from Local Mongo
  const localPosts = await localDb.collection('communityposts').find().toArray();
  console.log(`Found ${localPosts.length} posts in Local Mongo`);

  // 2. Fetch all users from Atlas Mongo to match user IDs
  const atlasUsers = await atlasDb.collection('users').find().toArray();
  console.log(`Found ${atlasUsers.length} users in Atlas Mongo`);

  // Find user milujiji (milujiji702@gmail.com) in Atlas
  const miluUser = atlasUsers.find(u => u.email === 'milujiji702@gmail.com' || u.username === 'milujiji' || u.name === 'milujiji');
  console.log('Found milujiji user in Atlas:', miluUser ? miluUser._id : 'Not found');

  // Remove any dummy seed posts from Atlas communityposts if requested, or append user posts
  // First, check existing posts in Atlas
  const atlasPosts = await atlasDb.collection('communityposts').find().toArray();
  console.log(`Atlas currently has ${atlasPosts.length} posts`);

  for (const post of localPosts) {
    console.log('\nProcessing Local Post:', post.content, 'by author:', post.authorName);
    
    // Target user in Atlas
    let targetUser = atlasUsers.find(u => 
      u.email === 'milujiji702@gmail.com' || 
      u.username === post.username || 
      u.name === post.authorName || 
      u.name === 'milujiji'
    ) || miluUser || atlasUsers[0];

    // Check if this post content already exists in Atlas
    const exists = await atlasDb.collection('communityposts').findOne({ content: post.content });
    if (!exists) {
      const newPostDoc = {
        user: targetUser._id,
        userId: targetUser._id.toString(),
        username: targetUser.username || targetUser.name || 'milujiji',
        authorName: targetUser.name || targetUser.fullName || 'milujiji',
        authorAvatar: targetUser.avatar || targetUser.profileImage || targetUser.profilePhoto || '',
        content: post.content,
        description: post.description || post.content,
        category: post.category || 'Plantation Update',
        image: post.image || '',
        images: post.images || (post.image ? [post.image] : []),
        likes: [],
        comments: post.comments || [],
        shares: post.shares || 0,
        savedBy: [],
        reports: [],
        createdAt: post.createdAt || new Date(),
        updatedAt: post.updatedAt || new Date(),
        __v: 0
      };

      await atlasDb.collection('communityposts').insertOne(newPostDoc);
      console.log('✅ Successfully migrated user post to Atlas Mongo! ID:', newPostDoc._id);
    } else {
      console.log('Post already exists in Atlas.');
    }
  }

  // Update existing Atlas seed posts if any, or link them to real users in Atlas
  const updatedAtlasPosts = await atlasDb.collection('communityposts').find().toArray();
  console.log(`\nFinal Atlas Community Posts Count: ${updatedAtlasPosts.length}`);
  for (const p of updatedAtlasPosts) {
    console.log(`- Post: "${p.content.substring(0, 50)}..." | Author: ${p.authorName} (${p.username})`);
  }

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
