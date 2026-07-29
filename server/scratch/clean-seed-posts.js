const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function cleanPosts() {
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log('Connected to Atlas Mongo!');

  const db = atlasConn.db;
  const postsCol = db.collection('communityposts');
  const usersCol = db.collection('users');

  // 1. Delete dummy seed posts (suresh_menon, devika_r, anand_k, priya_nair)
  const deleteResult = await postsCol.deleteMany({
    username: { $in: ['suresh_menon', 'devika_r', 'anand_k', 'priya_nair'] }
  });
  console.log(`Deleted ${deleteResult.deletedCount} dummy seed posts.`);

  // 2. Fetch remaining genuine posts
  const remaining = await postsCol.find().toArray();
  console.log(`\nRemaining Genuine Posts (${remaining.length}):`);
  for (const p of remaining) {
    console.log(`- Author: ${p.authorName} (${p.username}) | Content: "${p.content}"`);
  }

  await atlasConn.close();
  process.exit(0);
}

cleanPosts().catch(err => {
  console.error('Error cleaning posts:', err);
  process.exit(1);
});
