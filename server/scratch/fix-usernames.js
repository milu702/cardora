const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function fixUsernames() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  const users = await db.collection('users').find().toArray();
  for (const u of users) {
    if (!u.username || u.username.trim() === '') {
      const emailPrefix = u.email ? u.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') : 'user';
      const cleanUsername = `${emailPrefix}_${u._id.toString().slice(-4)}`;
      await db.collection('users').updateOne({ _id: u._id }, { $set: { username: cleanUsername } });
      console.log(`Updated username for ${u.email} to: ${cleanUsername}`);
    }
  }

  // Ensure specific users have clean usernames
  await db.collection('users').updateOne({ email: 'milujiji702@gmail.com' }, { $set: { username: 'milujiji' } });
  await db.collection('users').updateOne({ email: 'milujiji2027@mca.ajce.in' }, { $set: { username: 'milu' } });
  await db.collection('users').updateOne({ email: 'cardora702@gmail.com' }, { $set: { username: 'jiji' } });
  await db.collection('users').updateOne({ email: 'admin@cardora.io' }, { $set: { username: 'admin_planter' } });
  await db.collection('users').updateOne({ email: 'admin@cardora.com' }, { $set: { username: 'admin' } });
  await db.collection('users').updateOne({ email: 'ammu@gmail.com' }, { $set: { username: 'ammu' } });

  console.log('✅ All usernames fixed in Atlas!');
  await conn.close();
  process.exit(0);
}

fixUsernames().catch(e => console.error(e));
