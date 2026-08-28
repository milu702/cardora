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
    await seedInitialAuctions();
  } catch (err) {
    console.warn('Seed Platform Users notice:', err.message);
  }
};

const seedInitialAuctions = async () => {
  try {
    const Auction = require('../models/Auction');
    const User = require('../models/User');
    const Plantation = require('../models/Plantation');
    const Bid = require('../models/Bid');

    const count = await Auction.countDocuments();
    if (count === 0) {
      const defaultUser = (await User.findOne({ role: 'admin' })) || (await User.findOne());
      if (!defaultUser) return;

      let plantation = await Plantation.findOne({ user: defaultUser._id });
      if (!plantation) {
        plantation = await Plantation.create({
          user: defaultUser._id,
          name: 'Premium Kattappana Cardamom Estate',
          district: 'Idukki',
          location: 'Kattappana, Idukki, Kerala',
          area: 5.5,
          variety: 'Njallani Green Gold',
        });
      }

      const sampleAuctions = [
        {
          title: '🌿 Premium Idukki Cardamom Estate (5.5 Acres)',
          description: 'High-altitude organic cardamom plantation with mature Njallani Green Gold plants, automated drip irrigation, and high yield 8mm extra bold pods.',
          plantation: plantation._id,
          seller: defaultUser._id,
          location: 'Kattappana, Idukki, Kerala',
          district: 'Idukki',
          plantationType: 'Njallani Green Gold',
          areaAcres: 5.5,
          estimatedYieldKg: 1450,
          grade: 'AGEB (8mm Extra Bold)',
          startingPrice: 50000,
          currentBid: 65000,
          minIncrement: 1000,
          highestBidder: defaultUser._id,
          highestBidderMasked: 'Buyer #A82',
          biddersCount: 12,
          totalBidsCount: 18,
          startDate: new Date(),
          endDate: new Date(Date.now() + 2 * 3600 * 1000 + 45 * 60 * 1000),
          status: 'LIVE',
          images: [
            'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
          ],
          aiInsight: {
            recommendedMinPrice: 55000,
            recommendedMaxPrice: 70000,
            expectedDemand: 'Very High',
            marketTrend: '↗ Favorable Spices Board Index',
            reasoning: 'Prime soil quality and high-density planting in Kattappana command a 20% premium over regional base prices.',
          },
        },
        {
          title: '🌱 High Yield Devikulam Cardamom Grove (8.0 Acres)',
          description: 'Spectacular canopy shade management with disease-resistant Vazhukka variety. Complete IoT soil moisture sensors pre-installed.',
          plantation: plantation._id,
          seller: defaultUser._id,
          location: 'Devikulam, Idukki, Kerala',
          district: 'Idukki',
          plantationType: 'Vazhukka Special',
          areaAcres: 8.0,
          estimatedYieldKg: 2100,
          grade: 'AGB (7.5mm Bold)',
          startingPrice: 75000,
          currentBid: 88000,
          minIncrement: 2000,
          highestBidder: defaultUser._id,
          highestBidderMasked: 'Buyer #K14',
          biddersCount: 16,
          totalBidsCount: 24,
          startDate: new Date(),
          endDate: new Date(Date.now() + 15 * 60 * 1000 + 30 * 1000),
          status: 'ENDING_SOON',
          images: [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
          ],
          aiInsight: {
            recommendedMinPrice: 80000,
            recommendedMaxPrice: 95000,
            expectedDemand: 'High',
            marketTrend: '↗ Peak Demand',
            reasoning: 'Large acreage in Devikulam with active IoT telemetry commands high competition among premium spice exporters.',
          },
        },
        {
          title: '🌄 Wayanad High-Grade Spice Plantation (4.2 Acres)',
          description: 'Rich forest humus soil with inter-cropped black pepper and cardamom. Excellent access road and post-harvest drying yard.',
          plantation: plantation._id,
          seller: defaultUser._id,
          location: 'Meppadi, Wayanad, Kerala',
          district: 'Wayanad',
          plantationType: 'Green Gold Hybrid',
          areaAcres: 4.2,
          estimatedYieldKg: 980,
          grade: 'AGS (Grinded Special)',
          startingPrice: 42000,
          currentBid: 42000,
          minIncrement: 1000,
          highestBidderMasked: null,
          biddersCount: 0,
          totalBidsCount: 0,
          startDate: new Date(Date.now() + 12 * 3600 * 1000),
          endDate: new Date(Date.now() + 36 * 3600 * 1000),
          status: 'SCHEDULED',
          images: [
            'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
          ],
          aiInsight: {
            recommendedMinPrice: 45000,
            recommendedMaxPrice: 58000,
            expectedDemand: 'Moderate',
            marketTrend: '→ Stable Market Rate',
            reasoning: 'Good soil structure and moisture balance in Meppadi support steady bidding values.',
          },
        },
      ];

      for (const item of sampleAuctions) {
        const createdAuc = await Auction.create(item);
        if (createdAuc.currentBid > createdAuc.startingPrice) {
          await Bid.create({
            auction: createdAuc._id,
            bidder: defaultUser._id,
            bidderMasked: createdAuc.highestBidderMasked || 'Buyer #A82',
            amount: createdAuc.currentBid,
            isHighest: true,
            placedAt: new Date(),
          });
        }
      }
      console.log('🔨 Live Cardamom Auctions Initialized in MongoDB Atlas');
    }
  } catch (err) {
    console.warn('Seed Initial Auctions notice:', err.message);
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
