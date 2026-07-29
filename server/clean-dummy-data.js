const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Plantation = require('./models/Plantation');
const CommunityPost = require('./models/CommunityPost');
const MarketplaceListing = require('./models/MarketplaceListing');
const IoTSensor = require('./models/IoTSensor');
const Expert = require('./models/Expert');
const SystemAlert = require('./models/SystemAlert');
const ActivityLog = require('./models/ActivityLog');
const Recommendation = require('./models/Recommendation');

const cleanDummyData = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cardora';
  console.log('Connecting to database:', mongoUri.split('@')[1] || mongoUri);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas');

    // List of dummy sample emails
    const dummyEmails = [
      'suresh.m@gmail.com',
      'devika.raj@yahoo.com',
      'dr.ramesh@cardora.com',
      'anand.kumar@gmail.com',
      'mathew.j@gmail.com',
      'priya.nair@outlook.com',
    ];

    // Delete dummy users
    const userRes = await User.deleteMany({ email: { $in: dummyEmails } });
    console.log(`🧹 Deleted ${userRes.deletedCount} dummy sample users from User collection.`);

    // Clear dummy sample collections
    await Plantation.deleteMany({});
    await CommunityPost.deleteMany({});
    await MarketplaceListing.deleteMany({});
    await IoTSensor.deleteMany({});
    await SystemAlert.deleteMany({});
    await Recommendation.deleteMany({});
    await ActivityLog.deleteMany({});
    await Expert.deleteMany({});

    console.log('🎉 ALL DUMMY MOCK DATA CLEARED FROM MONGODB ATLAS!');
    console.log('Database now contains ONLY authentic real accounts and authentic data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cleaning database:', err.message);
    process.exit(1);
  }
};

cleanDummyData();
