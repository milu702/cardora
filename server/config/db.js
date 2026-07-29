const mongoose = require('mongoose');

let isConnected = false;
let activeHost = '127.0.0.1';
let activeDB = 'cardora';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ Database Connection Error: MONGODB_URI is not defined in .env');
    return;
  }

  // 1. Try MongoDB Atlas Connection first
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    activeHost = conn.connection.host;
    activeDB = conn.connection.name;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (database: ${conn.connection.name})`);
    await seedAdminUser();
    return;
  } catch (atlasErr) {
    console.warn(`⚠️ Atlas Connection Note (${atlasErr.message}). Connecting to Local MongoDB instance...`);
  }

  // 2. Fallback to Local MongoDB instance
  try {
    const localUri = 'mongodb://127.0.0.1:27017/cardora';
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    activeHost = conn.connection.host;
    activeDB = conn.connection.name;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (database: ${conn.connection.name})`);
    await seedAdminUser();
  } catch (localErr) {
    console.error(`❌ Database Connection Error: ${localErr.message}`);
    isConnected = false;
  }
};

const seedAdminUser = async () => {
  try {
    const User = require('../models/User');
    const adminEmail = 'admin@cardora.com';
    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      await User.create({
        name: 'System Admin',
        username: 'admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        location: 'Idukki, Kerala',
        district: 'Idukki, Kerala',
        bio: 'Cardora Platform Administrator',
        isVerified: true,
      });
      console.log('🔑 Default Admin Account Ready: admin@cardora.com / admin123');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log('🔑 Admin Role updated for admin@cardora.com');
    }
  } catch (err) {
    console.error('Seed Admin error:', err.message);
  }
};

const getDBStatus = () => {
  const readyState = mongoose.connection.readyState;
  const connected = readyState === 1 || isConnected;
  return {
    isConnected: connected,
    host: mongoose.connection.host || activeHost,
    database: mongoose.connection.name || activeDB,
    cluster: connected ? `MongoDB (${mongoose.connection.host || activeHost})` : 'MongoDB Atlas',
    statusText: connected ? `MongoDB Connected (${activeHost}) 🟢` : 'MongoDB Connecting... 🟡',
  };
};

module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;
