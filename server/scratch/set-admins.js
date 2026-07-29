const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');

async function updateAdminRoles() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const emailsToMakeAdmin = ['admin@cardora.com', 'admin@cardora.io', 'cardora702@gmail.com', 'milujiji702@gmail.com'];
  
  for (const email of emailsToMakeAdmin) {
    const res = await User.updateMany({ email }, { $set: { role: 'admin' } });
    console.log(`Updated ${email} to admin:`, res);
  }

  process.exit(0);
}

updateAdminRoles();
