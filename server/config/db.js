const mongoose = require('mongoose');

let isConnected = false;
let activeHost = '127.0.0.1';
let activeDB = 'cardora';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://milujiji2027_db_user:8ZODK6ONzNuKEqbr@cluster0.g3pxvi3.mongodb.net/cardora?retryWrites=true&w=majority&appName=Cluster0';
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/cardora';

  // 1. Try Primary MongoDB Atlas Instance first (contains all real user accounts & database records)
  try {
    const conn = await mongoose.connect(mongoUri, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    activeHost = conn.connection.host;
    activeDB = conn.connection.name;
    console.log(`✅ Atlas MongoDB Connected Successfully: ${conn.connection.host} (database: ${conn.connection.name})`);
    await seedAdminUser();
    return;
  } catch (atlasErr) {
    console.warn(`⚠️ Atlas MongoDB Note (${atlasErr.message}). Falling back to Local MongoDB...`);
  }

  // 2. Fallback to Local MongoDB instance
  try {
    const conn = await mongoose.connect(localUri, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    activeHost = conn.connection.host;
    activeDB = conn.connection.name;
    console.log(`✅ Local MongoDB Connected Successfully: ${conn.connection.host} (database: ${conn.connection.name})`);
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
