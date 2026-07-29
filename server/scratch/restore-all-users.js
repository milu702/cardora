const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

const allUsersData = [
  {
    name: 'milujiji',
    username: 'milujiji',
    email: 'milujiji702@gmail.com',
    password: 'admin123',
    role: 'Farmer',
    location: 'Kattappana, Idukki',
    district: 'Idukki, Kerala',
    bio: 'Cardamom cultivator & planter in Kattappana, Idukki',
    isVerified: true,
    createdAt: new Date('2026-07-26T11:29:42.000Z')
  },
  {
    name: 'Cardora Planter Admin',
    username: 'admin_planter',
    email: 'admin@cardora.io',
    password: 'admin123',
    role: 'admin',
    location: 'Idukki, Kerala',
    district: 'Idukki, Kerala',
    bio: 'Cardora Official Platform Administrator',
    isVerified: true,
    createdAt: new Date('2026-07-26T11:27:07.000Z')
  },
  {
    name: 'milu',
    username: 'milu',
    email: 'milujiji2027@mca.ajce.in',
    password: 'user123',
    role: 'Farmer',
    location: 'Idukki, Kerala',
    district: 'Idukki, Kerala',
    bio: 'High altitude cardamom estate cultivator',
    isVerified: true,
    createdAt: new Date('2026-07-26T11:35:30.000Z')
  },
  {
    name: 'Kiran',
    username: 'kiran',
    email: 'kiran@cardora.io',
    password: 'user123',
    role: 'Farmer',
    location: 'Vandiperiyar, Idukki',
    district: 'Idukki, Kerala',
    bio: 'Vazhukka organic planter',
    isVerified: true,
    createdAt: new Date('2026-07-26T11:44:27.000Z')
  },
  {
    name: 'milujiji',
    username: 'milujiji7022',
    email: 'milujiji7022@gmail.com',
    password: 'user123',
    role: 'Farmer',
    location: 'Idukki, Kerala',
    district: 'Idukki, Kerala',
    bio: 'Spice planter and investor',
    isVerified: true,
    createdAt: new Date('2026-07-26T12:04:07.000Z')
  },
  {
    name: 'ammu',
    username: 'ammu',
    email: 'ammu@gmail.com',
    password: 'user123',
    role: 'Farmer',
    location: 'Wayanad, Kerala',
    district: 'Wayanad',
    bio: 'Organic cardamom grower',
    isVerified: true,
    createdAt: new Date('2026-07-26T13:58:49.000Z')
  },
  {
    name: 'jiji',
    username: 'jiji',
    email: 'cardora702@gmail.com',
    password: 'admin123',
    role: 'Farmer',
    location: 'Idukki, Kerala',
    district: 'Idukki, Kerala',
    bio: 'Cardora planter & community contributor',
    isVerified: true,
    createdAt: new Date('2026-07-26T18:53:10.000Z')
  },
  {
    name: 'System Administrator',
    username: 'admin',
    email: 'admin@cardora.com',
    password: 'admin123',
    role: 'admin',
    location: 'Idukki, Kerala',
    district: 'Idukki, Kerala',
    bio: 'Chief System Administrator',
    isVerified: true,
    createdAt: new Date('2026-07-27T14:55:44.000Z')
  },
  {
    name: 'annu',
    username: 'annu',
    email: 'annushaji@gmail.com',
    password: 'user123',
    role: 'Expert',
    location: 'Idukki, Kerala',
    district: 'Idukki, Kerala',
    bio: 'Cardamom Soil & Agronomy Specialist',
    isVerified: true,
    createdAt: new Date('2026-07-29T22:23:54.000Z')
  }
];

async function restoreAllUsers() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;
  const usersCol = db.collection('users');

  console.log('Restoring user accounts into MongoDB Atlas...');

  const salt = await bcrypt.genSalt(10);
  const defaultHashedPassword = await bcrypt.hash('admin123', salt);

  for (const uData of allUsersData) {
    const existing = await usersCol.findOne({ email: uData.email });
    if (!existing) {
      await usersCol.insertOne({
        name: uData.name,
        username: uData.username,
        email: uData.email,
        password: defaultHashedPassword,
        role: uData.role,
        location: uData.location,
        district: uData.district,
        bio: uData.bio,
        isVerified: true,
        status: 'active',
        hasCustomPhoto: false,
        profileImage: '',
        profilePhoto: '',
        avatar: '',
        createdAt: uData.createdAt,
        updatedAt: uData.createdAt,
      });
      console.log(`+ Restored User: ${uData.email} (${uData.name})`);
    } else {
      await usersCol.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: uData.name,
            username: uData.username,
            role: uData.role,
            location: uData.location,
            district: uData.district,
            bio: uData.bio,
            isVerified: true,
            status: 'active',
          }
        }
      );
      console.log(`~ Updated Existing User: ${uData.email} (${uData.name})`);
    }
  }

  const finalUsers = await usersCol.find().toArray();
  console.log(`\n🎉 SUCCESS! Total users in MongoDB Atlas: ${finalUsers.length} documents`);

  await conn.close();
  process.exit(0);
}

restoreAllUsers().catch(e => console.error(e));
