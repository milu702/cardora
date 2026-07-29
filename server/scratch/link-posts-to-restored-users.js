const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function linkPosts() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  const usersCol = db.collection('users');
  const postsCol = db.collection('communityposts');

  const miluJiji = await usersCol.findOne({ email: 'milujiji702@gmail.com' });
  const milu = await usersCol.findOne({ email: 'milujiji2027@mca.ajce.in' });
  const adminIo = await usersCol.findOne({ email: 'admin@cardora.io' });

  if (miluJiji) {
    await postsCol.updateMany(
      { content: /investigation about cardamom/i },
      { $set: { user: miluJiji._id, userId: miluJiji._id.toString(), username: 'milujiji', authorName: 'milujiji' } }
    );
  }

  if (milu) {
    await postsCol.updateMany(
      { content: /canopy shading/i },
      { $set: { user: milu._id, userId: milu._id.toString(), username: 'milu', authorName: 'milu' } }
    );
  }

  if (adminIo) {
    await postsCol.updateMany(
      { content: /Agronomic Advisory/i },
      { $set: { user: adminIo._id, userId: adminIo._id.toString(), username: 'admin_planter', authorName: 'Cardora Planter Admin' } }
    );
  }

  console.log('✅ Community posts re-linked to restored user ObjectIds!');
  await conn.close();
  process.exit(0);
}

linkPosts().catch(e => console.error(e));
