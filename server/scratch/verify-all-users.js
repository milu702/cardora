const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function verifyAllUsers() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  const users = await db.collection('users').find().toArray();
  console.log(`✅ TOTAL USERS IN MONGODB ATLAS: ${users.length} documents\n`);

  users.forEach((u, i) => {
    console.log(`${i + 1}. [${u.role.toUpperCase()}] ${u.name} (@${u.username})`);
    console.log(`   Email: ${u.email} | District: ${u.district || u.location} | Created: ${u.createdAt}`);
  });

  await conn.close();
  process.exit(0);
}

verifyAllUsers().catch(e => console.error(e));
