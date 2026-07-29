const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function fixUserDataAndDates() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  console.log('Connected to Atlas!');

  const usersCol = db.collection('users');
  const postsCol = db.collection('communityposts');
  const plantationsCol = db.collection('plantations');
  const listingsCol = db.collection('marketplacelistings');

  // Fetch key users
  const miluJiji = await usersCol.findOne({ email: 'milujiji702@gmail.com' });
  const milu = await usersCol.findOne({ email: 'milujiji2027@mca.ajce.in' });
  const jiji = await usersCol.findOne({ email: 'cardora702@gmail.com' });
  const adminIo = await usersCol.findOne({ email: 'admin@cardora.io' });
  const adminCom = await usersCol.findOne({ email: 'admin@cardora.com' });
  const ammu = await usersCol.findOne({ email: 'ammu@gmail.com' });

  // Original registration date July 26, 2026
  const jul26Date = new Date('2026-07-26T11:30:00.000Z');

  // 1. Update Community Posts dates & user links
  await postsCol.updateMany(
    { content: /investigation about cardamom/i },
    {
      $set: {
        user: miluJiji._id,
        userId: miluJiji._id.toString(),
        username: 'milujiji',
        authorName: 'milujiji',
        createdAt: jul26Date,
        updatedAt: jul26Date
      }
    }
  );

  await postsCol.updateMany(
    { content: /canopy shading/i },
    {
      $set: {
        user: milu._id,
        userId: milu._id.toString(),
        username: 'milu',
        authorName: 'milu',
        createdAt: jul26Date,
        updatedAt: jul26Date
      }
    }
  );

  await postsCol.updateMany(
    { content: /Agronomic Advisory/i },
    {
      $set: {
        user: adminIo._id,
        userId: adminIo._id.toString(),
        username: 'admin_planter',
        authorName: 'Cardora Planter Admin',
        createdAt: jul26Date,
        updatedAt: jul26Date
      }
    }
  );

  // 2. Link Plantations to User Accounts & set date to July 26, 2026
  const plantations = await plantationsCol.find().toArray();
  if (plantations.length > 0) {
    if (plantations[0] && miluJiji) {
      await plantationsCol.updateOne({ _id: plantations[0]._id }, { $set: { user: miluJiji._id, owner: miluJiji.name, createdAt: jul26Date } });
    }
    if (plantations[1] && milu) {
      await plantationsCol.updateOne({ _id: plantations[1]._id }, { $set: { user: milu._id, owner: milu.name, createdAt: jul26Date } });
    }
    if (plantations[2] && jiji) {
      await plantationsCol.updateOne({ _id: plantations[2]._id }, { $set: { user: jiji._id, owner: jiji.name, createdAt: jul26Date } });
    }
    if (plantations[3] && adminIo) {
      await plantationsCol.updateOne({ _id: plantations[3]._id }, { $set: { user: adminIo._id, owner: adminIo.name, createdAt: jul26Date } });
    }
    if (plantations[4] && ammu) {
      await plantationsCol.updateOne({ _id: plantations[4]._id }, { $set: { user: ammu._id, owner: ammu.name, createdAt: jul26Date } });
    }
  }

  // 3. Link Marketplace Listings to User Accounts & set date to July 26, 2026
  const listings = await listingsCol.find().toArray();
  if (listings.length > 0) {
    if (listings[0] && miluJiji) {
      await listingsCol.updateOne({ _id: listings[0]._id }, { $set: { user: miluJiji._id, ownerName: miluJiji.name, ownerEmail: miluJiji.email, createdAt: jul26Date } });
    }
    if (listings[1] && milu) {
      await listingsCol.updateOne({ _id: listings[1]._id }, { $set: { user: milu._id, ownerName: milu.name, ownerEmail: milu.email, createdAt: jul26Date } });
    }
    if (listings[2] && jiji) {
      await listingsCol.updateOne({ _id: listings[2]._id }, { $set: { user: jiji._id, ownerName: jiji.name, ownerEmail: jiji.email, createdAt: jul26Date } });
    }
    if (listings[3] && adminIo) {
      await listingsCol.updateOne({ _id: listings[3]._id }, { $set: { user: adminIo._id, ownerName: adminIo.name, ownerEmail: adminIo.email, createdAt: jul26Date } });
    }
  }

  // 4. Ensure profiles have complete info & photos
  await usersCol.updateOne(
    { email: 'milujiji702@gmail.com' },
    {
      $set: {
        location: 'Idukki, Kerala',
        district: 'Idukki, Kerala',
        bio: 'Cardamom cultivator & planter in Kattappana, Idukki',
        role: 'admin',
        isVerified: true
      }
    }
  );

  await usersCol.updateOne(
    { email: 'cardora702@gmail.com' },
    {
      $set: {
        location: 'Idukki, Kerala',
        district: 'Idukki, Kerala',
        bio: 'Cardora Platform Administrator',
        role: 'admin',
        isVerified: true
      }
    }
  );

  console.log('🎉 Successfully updated all posts, plantations, listings, profiles, and creation dates to July 26, 2026!');
  await conn.close();
  process.exit(0);
}

fixUserDataAndDates().catch(e => console.error('Error:', e));
