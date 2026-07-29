const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('Connecting to URI:', mongoUri);

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas!');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`Collection: "${col.name}" -> ${count} documents`);
    }

    // Inspect user and users collections sample
    if (collections.some(c => c.name === 'user')) {
      const userDocs = await db.collection('user').find().limit(3).toArray();
      console.log('\n--- Sample from "user" collection ---');
      console.log(JSON.stringify(userDocs, null, 2));
    }

    if (collections.some(c => c.name === 'users')) {
      const usersDocs = await db.collection('users').find().limit(3).toArray();
      console.log('\n--- Sample from "users" collection ---');
      console.log(JSON.stringify(usersDocs, null, 2));
    }

    if (collections.some(c => c.name === 'communityposts')) {
      const postDocs = await db.collection('communityposts').find().limit(3).toArray();
      console.log('\n--- Sample from "communityposts" collection ---');
      console.log(JSON.stringify(postDocs, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error connecting/querying Atlas:', err);
    process.exit(1);
  }
}

check();
