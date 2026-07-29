const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function checkAndFixRoles() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  console.log('=== CURRENT USERS IN ATLAS ===');
  const users = await db.collection('users').find().toArray();
  for (const u of users) {
    console.log(`User: ${u.email} | Name: "${u.name}" | Role: "${u.role}" | Username: "${u.username}" | GoogleId: "${u.googleId}"`);
  }

  await conn.close();
  process.exit(0);
}

checkAndFixRoles().catch(e => console.error(e));
