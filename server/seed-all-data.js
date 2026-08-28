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
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');

const seedAllData = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cardora';
  console.log('Connecting to database:', mongoUri.split('@')[1] || mongoUri);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas');

    // Fetch User Documents
    const suresh = await User.findOne({ email: 'suresh.m@gmail.com' });
    const devika = await User.findOne({ email: 'devika.raj@yahoo.com' });
    const anand = await User.findOne({ email: 'anand.kumar@gmail.com' });
    const mathew = await User.findOne({ email: 'mathew.j@gmail.com' });
    const priya = await User.findOne({ email: 'priya.nair@outlook.com' });
    const admin = await User.findOne({ email: 'admin@cardora.com' });

    const defaultUser = suresh || admin || (await User.findOne());

    if (!defaultUser) {
      console.error('❌ No user found in MongoDB to link records to!');
      process.exit(1);
    }

    // 1. Seed Plantations
    const plantationCount = await Plantation.countDocuments();
    if (plantationCount === 0) {
      const plantationsData = [
        {
          user: suresh ? suresh._id : defaultUser._id,
          name: 'Western Ghats Malabar Plot',
          location: 'Kattappana, Idukki',
          area: 12,
          plantsCount: 3600,
          plantAge: '4 Years',
          variety: 'Malabar Grade-1 Extra Bold',
          soilPh: 6.2,
          moisture: 74,
          healthScore: 95,
          weather: { temp: '22°C', condition: 'Canopy Breeze', humidity: '80%' },
        },
        {
          user: devika ? devika._id : defaultUser._id,
          name: 'High Altitude Green Valley Estate',
          location: 'Vandiperiyar, Idukki',
          area: 8,
          plantsCount: 2400,
          plantAge: '3 Years',
          variety: 'Vazhukka Organic',
          soilPh: 6.0,
          moisture: 68,
          healthScore: 91,
          weather: { temp: '21°C', condition: 'Mist Canopy', humidity: '84%' },
        },
        {
          user: anand ? anand._id : defaultUser._id,
          name: 'Santhanpara Shade Garden',
          location: 'Santhanpara, Idukki',
          area: 15,
          plantsCount: 4500,
          plantAge: '5 Years',
          variety: 'Mysore Bold 8mm',
          soilPh: 6.4,
          moisture: 82,
          healthScore: 98,
          weather: { temp: '20°C', condition: 'Clear Mountain Canopy', humidity: '76%' },
        },
        {
          user: mathew ? mathew._id : defaultUser._id,
          name: 'Nedumkandam Organic Farm',
          location: 'Nedumkandam, Idukki',
          area: 10,
          plantsCount: 3000,
          plantAge: '4 Years',
          variety: 'Njallani Green Gold',
          soilPh: 6.1,
          moisture: 70,
          healthScore: 89,
          weather: { temp: '23°C', condition: 'Humid Breeze', humidity: '79%' },
        },
        {
          user: priya ? priya._id : defaultUser._id,
          name: 'Munnar Mist Cardamom Estate',
          location: 'Munnar, Idukki',
          area: 14,
          plantsCount: 4200,
          plantAge: '6 Years',
          variety: 'Vazhukka High Yield',
          soilPh: 5.9,
          moisture: 78,
          healthScore: 96,
          weather: { temp: '18°C', condition: 'Highland Mist', humidity: '88%' },
        },
      ];
      await Plantation.insertMany(plantationsData);
      console.log('✅ Seeded 5 Cardamom Estates in Plantation collection');
    }

    // 2. Seed Community Posts
    const postsCount = await CommunityPost.countDocuments();
    if (postsCount < 3) {
      const postsData = [
        {
          user: suresh ? suresh._id : defaultUser._id,
          userId: (suresh ? suresh._id : defaultUser._id).toString(),
          username: suresh ? suresh.username : 'suresh_menon',
          authorName: suresh ? suresh.name : 'Suresh Menon',
          authorAvatar: '',
          title: 'Managing Capsule Rot (Azhukal) Disease during Monsoons in Kattappana',
          content: 'Noticed early capsule rot signs on lower cardamom tillers after heavy rainfall in Kattappana. What bio-fungicide frequency is recommended by agro experts for organic soil drenching?',
          description: 'Noticed early capsule rot signs on lower cardamom tillers after heavy rainfall in Kattappana. What bio-fungicide frequency is recommended by agro experts for organic soil drenching?',
          category: 'Disease Diagnostics',
          likes: [],
          comments: [
            {
              user: devika ? devika._id : defaultUser._id,
              authorName: devika ? devika.name : 'Devika Raj',
              text: 'Recommend 1% Bordeaux mixture spray along with Trichoderma harzianum soil drenching!',
            },
          ],
        },
        {
          user: devika ? devika._id : defaultUser._id,
          userId: (devika ? devika._id : defaultUser._id).toString(),
          username: devika ? devika.username : 'devika_r',
          authorName: devika ? devika.name : 'Devika Raj',
          authorAvatar: '',
          title: 'Optimal Shade Tree Density for Organic Vazhukka Variety',
          content: 'We are maintaining 50% shade cover using Silver Oak and Cedar trees in Vandiperiyar. Yield quality has improved drastically with Grade 1 8mm capsules.',
          description: 'We are maintaining 50% shade cover using Silver Oak and Cedar trees in Vandiperiyar. Yield quality has improved drastically with Grade 1 8mm capsules.',
          category: 'Harvest & Drying',
          likes: [],
          comments: [],
        },
        {
          user: anand ? anand._id : defaultUser._id,
          userId: (anand ? anand._id : defaultUser._id).toString(),
          username: anand ? anand.username : 'anand_k',
          authorName: anand ? anand.name : 'Anand Kumar',
          authorAvatar: '',
          title: 'Spices Board Auction Price Update - Santhanpara Grade 1 Extra Bold',
          content: 'Cardamom auction prices reached ₹2,850/kg for Extra Bold 8mm capsules today. Strong export demand from Middle East markets.',
          description: 'Cardamom auction prices reached ₹2,850/kg for Extra Bold 8mm capsules today. Strong export demand from Middle East markets.',
          category: 'Market Price',
          likes: [],
          comments: [],
        },
        {
          user: priya ? priya._id : defaultUser._id,
          userId: (priya ? priya._id : defaultUser._id).toString(),
          username: priya ? priya.username : 'priya_nair',
          authorName: priya ? priya.name : 'Priya Nair',
          authorAvatar: '',
          title: 'Drip Irrigation & Soil Moisture Sensors in High Altitude Canopies',
          content: 'Automated IoT drip system maintaining 78% root moisture in Munnar mist plantation. Reduced water usage by 35%.',
          description: 'Automated IoT drip system maintaining 78% root moisture in Munnar mist plantation. Reduced water usage by 35%.',
          category: 'Fertilizers',
          likes: [],
          comments: [],
        },
      ];
      await CommunityPost.insertMany(postsData);
      console.log('✅ Seeded Community Posts in CommunityPost collection');
    }

    // 3. Seed Marketplace Listings
    const listingsCount = await MarketplaceListing.countDocuments();
    if (listingsCount === 0) {
      const listingsData = [
        {
          user: suresh ? suresh._id : defaultUser._id,
          ownerName: 'Suresh Menon',
          ownerEmail: 'suresh.m@gmail.com',
          ownerPhone: '+91 94471 22334',
          title: '12 Acre Prime Cardamom Estate with Active Canopy Drip',
          description: 'Fully developed high-yield cardamom plot in Kattappana, Idukki. High altitude shade canopy, automated irrigation, and drying yard facility.',
          location: 'Kattappana, Idukki',
          area: '12 Acres',
          price: '₹85,000 / Year per Acre',
          type: 'lease',
          roi: '26%',
          healthScore: 95,
          status: 'active',
        },
        {
          user: devika ? devika._id : defaultUser._id,
          ownerName: 'Devika Raj',
          ownerEmail: 'devika.raj@yahoo.com',
          ownerPhone: '+91 98460 55667',
          title: '8 Acre Organic Vazhukka Cardamom Plot',
          description: 'Certified organic plantation with mature Vazhukka variety plants. Excellent soil pH (6.0) and natural mountain spring water source.',
          location: 'Vandiperiyar, Idukki',
          area: '8 Acres',
          price: '₹62,000 / Year per Acre',
          type: 'lease',
          roi: '22%',
          healthScore: 91,
          status: 'active',
        },
        {
          user: anand ? anand._id : defaultUser._id,
          ownerName: 'Anand Kumar',
          ownerEmail: 'anand.kumar@gmail.com',
          ownerPhone: '+91 94952 88990',
          title: '15 Acre Commercial Grade-1 Export Estate',
          description: 'State-of-the-art cardamom plantation equipped with IoT soil sensors, weather station, and solar powered drying unit.',
          location: 'Santhanpara, Idukki',
          area: '15 Acres',
          price: '₹1,20,000 / Year per Acre',
          type: 'lease',
          roi: '28%',
          healthScore: 98,
          status: 'active',
        },
        {
          user: mathew ? mathew._id : defaultUser._id,
          ownerName: 'Mathew Joseph',
          ownerEmail: 'mathew.j@gmail.com',
          ownerPhone: '+91 94473 11223',
          title: '10 Acre High Yield Njallani Variety Farm',
          description: 'High density Njallani Gold cardamom farm with 3,000 bearing plants. Ready for immediate harvest season.',
          location: 'Nedumkandam, Idukki',
          area: '10 Acres',
          price: '₹75,000 / Year per Acre',
          type: 'lease',
          roi: '24%',
          healthScore: 89,
          status: 'active',
        },
      ];
      await MarketplaceListing.insertMany(listingsData);
      console.log('✅ Seeded Marketplace Listings in MarketplaceListing collection');
    }

    // 4. Seed Recommendations / AI Scans
    const recCount = await Recommendation.countDocuments();
    if (recCount < 5) {
      const recData = Array.from({ length: 18 }).map((_, i) => ({
        user: defaultUser._id,
        soilPh: 6.2,
        moisture: 74,
        healthScore: 92 + (i % 7),
        yieldPrediction: '450 kg/Acre (Extra Bold Grade 1)',
        diseaseRisk: i % 3 === 0 ? 'Capsule Rot (Low)' : i % 3 === 1 ? 'Thrips Incident' : 'Clean Canopy',
        fertilizerAdvice: 'Apply 140:45:180 NPK ratio along with Organic Neem Cake soil drenching.',
        irrigationSchedule: 'Run pulse drip for 90 mins every morning at 06:00 AM.',
        weatherSummary: 'Idukki High Altitude 22°C, 78% Humidity',
        createdAt: new Date(),
      }));
      await Recommendation.insertMany(recData);
      console.log('✅ Seeded Recommendations / AI Scans');
    }

    // 5. Seed IoT Sensors
    const sensorCount = await IoTSensor.countDocuments();
    if (sensorCount === 0) {
      await IoTSensor.insertMany([
        { sensorId: 'SENSOR-IDK-01', plantationName: 'Western Ghats Malabar Plot', ownerName: 'Suresh Menon', district: 'Kattappana, Idukki', moisture: 74, temperature: 22, humidity: 80, status: 'active' },
        { sensorId: 'SENSOR-IDK-02', plantationName: 'High Altitude Green Valley', ownerName: 'Devika Raj', district: 'Vandiperiyar, Idukki', moisture: 68, temperature: 21, humidity: 84, status: 'active' },
        { sensorId: 'SENSOR-IDK-03', plantationName: 'Santhanpara Shade Garden', ownerName: 'Anand Kumar', district: 'Santhanpara, Idukki', moisture: 82, temperature: 20, humidity: 76, status: 'active' },
        { sensorId: 'SENSOR-IDK-04', plantationName: 'Nedumkandam Organic Farm', ownerName: 'Mathew Joseph', district: 'Nedumkandam, Idukki', moisture: 70, temperature: 23, humidity: 79, status: 'active' },
        { sensorId: 'SENSOR-IDK-05', plantationName: 'Munnar Mist Plantation', ownerName: 'Priya Nair', district: 'Munnar, Idukki', moisture: 78, temperature: 18, humidity: 88, status: 'active' },
      ]);
      console.log('✅ Seeded IoT Sensors');
    }

    // 7. Seed Live Cardamom Auctions & Bids
    const auctionCount = await Auction.countDocuments();
    if (auctionCount === 0) {
      const samplePlantation = await Plantation.findOne({ user: defaultUser._id }) || await Plantation.findOne();
      const sampleAuction = await Auction.create({
        title: '🌿 Premium Idukki Cardamom Estate (5.5 Acres)',
        description: 'High-altitude organic cardamom plantation with mature Njallani Green Gold plants, automated drip irrigation, and high yield 8mm extra bold pods.',
        plantation: samplePlantation ? samplePlantation._id : defaultUser._id,
        seller: defaultUser._id,
        location: 'Kattappana, Idukki, Kerala',
        district: 'Idukki',
        plantationType: 'Njallani Green Gold',
        areaAcres: 5.5,
        estimatedYieldKg: 1450,
        grade: 'AGEB (8mm Extra Bold)',
        startingPrice: 50000,
        currentBid: 68000,
        minIncrement: 1000,
        highestBidder: defaultUser._id,
        highestBidderMasked: 'Buyer #A82',
        biddersCount: 8,
        totalBidsCount: 14,
        startDate: new Date(),
        endDate: new Date(Date.now() + 48 * 3600 * 1000),
        status: 'LIVE',
        images: [
          'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
        ],
        aiInsight: {
          recommendedMinPrice: 55000,
          recommendedMaxPrice: 72000,
          expectedDemand: 'Very High',
          marketTrend: '↗ Favorable Spices Board Index',
          reasoning: 'Prime soil quality and high-density planting command a 20% premium over regional base rates.',
        },
      });

      await Bid.create({
        auction: sampleAuction._id,
        bidder: defaultUser._id,
        bidderMasked: 'Buyer #A82',
        amount: 68000,
        isHighest: true,
        placedAt: new Date(),
      });
      console.log('✅ Seeded Auctions & Bids');
    }

    console.log('🎉 ALL DATABASE COLLECTIONS POPULATED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding all data:', err.message);
    process.exit(1);
  }
};

seedAllData();
