const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

function capitalize(str) {
  if (!str) return 'Planter';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fixRolesAndNames() {
  const conn = await mongoose.createConnection(atlasUri).asPromise();
  const db = conn.db;

  const usersCol = db.collection('users');
  const users = await usersCol.find().toArray();

  console.log('Processing users in MongoDB Atlas...');

  for (const u of users) {
    const email = u.email || '';
    const emailPrefix = email.split('@')[0] || 'planter';

    // Format a clean, unique name from email prefix if it's currently generic "Cardora Planter"
    let cleanName = u.name;
    if (!cleanName || cleanName === 'Cardora Planter' || cleanName === 'System Admin') {
      if (email.includes('admin@cardora.com')) cleanName = 'System Administrator';
      else if (email.includes('admin@cardora.io')) cleanName = 'Cardora Admin';
      else if (email.includes('milujiji702')) cleanName = 'Milu Jiji';
      else if (email.includes('milujiji2027')) cleanName = 'Milu';
      else if (email.includes('cardora702')) cleanName = 'Jiji';
      else if (email.includes('ammu')) cleanName = 'Ammu';
      else if (email.includes('kiran')) cleanName = 'Kiran';
      else cleanName = capitalize(emailPrefix.replace(/[^a-zA-Z]/g, ' ')).trim();
    }

    // Determine clean username
    let cleanUsername = u.username;
    if (!cleanUsername || cleanUsername.includes('_b2') || cleanUsername === 'planter') {
      cleanUsername = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }

    // Role assignment: ONLY admin@cardora.com and admin@cardora.io are admins!
    let role = 'Farmer';
    if (email === 'admin@cardora.com' || email === 'admin@cardora.io') {
      role = 'admin';
    }

    await usersCol.updateOne(
      { _id: u._id },
      {
        $set: {
          name: cleanName,
          username: cleanUsername,
          role: role,
          isVerified: true
        }
      }
    );

    console.log(`Updated -> Email: ${email} | Name: "${cleanName}" | Username: "${cleanUsername}" | Role: "${role}"`);
  }

  console.log('\n🎉 ALL USER ROLES AND NAMES FIXED IN MONGODB ATLAS!');
  await conn.close();
  process.exit(0);
}

fixRolesAndNames().catch(e => console.error(e));
