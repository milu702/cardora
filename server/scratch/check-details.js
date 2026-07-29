const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function checkDetails() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  console.log('=== USERS IN ATLAS ===');
  const users = await db.collection('users').find().toArray();
  for (const u of users) {
    console.log(`- ID: ${u._id} | Name: "${u.name}" | Email: "${u.email}" | Role: "${u.role}" | CreatedAt: "${u.createdAt}"`);
  }

  console.log('\n=== COMMUNITY POSTS IN ATLAS ===');
  const posts = await db.collection('communityposts').find().toArray();
  for (const p of posts) {
    console.log(`- ID: ${p._id} | Author: "${p.authorName}" (${p.username}) | Content: "${p.content}" | CreatedAt: "${p.createdAt}"`);
  }

  await conn.close();
  process.exit(0);
}

checkDetails().catch(e => console.error(e));
