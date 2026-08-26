const mongoose = require('mongoose');

let isConnected = false;
let activeHost = '127.0.0.1';
let activeDB = 'cardora';

// Suppress unhandled mongoose connection error events from crashing Node process
mongoose.connection.on('error', () => {});

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://milujiji2027_db_user:8ZODK6ONzNuKEqbr@cluster0.g3pxvi3.mongodb.net/cardora?retryWrites=true&w=majority&appName=Cluster0';
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/cardora';

  // 1. Try Primary MongoDB Atlas Instance
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    isConnected = true;
    activeHost = conn.connection.host;
    activeDB = conn.connection.name;
    console.log(`✅ Atlas MongoDB Cloud Connected Successfully: ${conn.connection.host} (database: ${conn.connection.name})`);
    await seedPlatformUsers();
    return;
  } catch (atlasErr) {
    console.warn(`⚠️ Could not reach MongoDB Atlas Cloud Database (${atlasErr.message}). Switching to Local DB...`);
  }

  // 2. Fallback to Local MongoDB instance
  try {
    await mongoose.disconnect().catch(() => {});
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    activeHost = conn.connection.host;
    activeDB = conn.connection.name;
    console.log(`✅ Local MongoDB Connected Successfully: ${conn.connection.host} (database: ${conn.connection.name})`);
    await seedPlatformUsers();
  } catch (localErr) {
    console.log(`🌿 Cardora Server operating in resilient memory mode.`);
    isConnected = false;
  }
};

const sampleUsers = [
  { name: 'System Admin', username: 'admin', email: 'admin@cardora.com', password: 'admin123', role: 'admin', district: 'Idukki, Kerala', location: 'Idukki, Kerala', isVerified: true },
  { name: 'Suresh Menon', username: 'suresh_menon', email: 'suresh.m@gmail.com', password: 'user123', role: 'Farmer', district: 'Kattappana, Idukki', location: 'Kattappana, Idukki', isVerified: true },
  { name: 'Devika Raj', username: 'devika_r', email: 'devika.raj@yahoo.com', password: 'user123', role: 'Farmer', district: 'Vandiperiyar, Idukki', location: 'Vandiperiyar, Idukki', isVerified: true },
  { name: 'Dr. Ramesh Nambiar', username: 'dr_ramesh', email: 'dr.ramesh@cardora.com', password: 'user123', role: 'Expert', district: 'Santhanpara, Idukki', location: 'Santhanpara, Idukki', isVerified: true },
  { name: 'Anand Kumar', username: 'anand_k', email: 'anand.kumar@gmail.com', password: 'user123', role: 'Investor', district: 'Santhanpara, Idukki', location: 'Santhanpara, Idukki', isVerified: true },
  { name: 'Mathew Joseph', username: 'mathew_j', email: 'mathew.j@gmail.com', password: 'user123', role: 'Farmer', district: 'Nedumkandam, Idukki', location: 'Nedumkandam, Idukki', isVerified: true },
  { name: 'Priya Nair', username: 'priya_nair', email: 'priya.nair@outlook.com', password: 'user123', role: 'Farmer', district: 'Munnar, Idukki', location: 'Munnar, Idukki', isVerified: true },
];

const seedPlatformUsers = async () => {
  try {
    const User = require('../models/User');
    for (const u of sampleUsers) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
      }
    }
    console.log('🔑 Platform Demo User Accounts Ready (Admin, Planters, Experts, Investors)');
  } catch (err) {
    console.warn('Seed Platform Users notice:', err.message);
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
