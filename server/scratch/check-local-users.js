const mongoose = require('mongoose');

async function checkLocalUsers() {
  try {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/cardora').asPromise();
    const db = conn.db;

    const users = await db.collection('users').find().toArray();
    console.log(`LOCAL MONGO USERS: ${users.length} documents`);
    users.forEach(u => console.log(`- ${u.email} | ${u.name} | ${u.role}`));

    await conn.close();
  } catch (e) {
    console.log('Local Mongo check note:', e.message);
  }
}

checkLocalUsers();
