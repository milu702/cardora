const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const sampleUsers = [
  {
    name: 'System Admin',
    username: 'admin',
    email: 'admin@cardora.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    district: 'Idukki, Kerala',
    location: 'Idukki, Kerala',
    phone: '+91 94470 00000',
    bio: 'System Administrator & Cardora Platform Operator.',
    isVerified: true,
  },
  {
    name: 'Suresh Menon',
    username: 'suresh_menon',
    email: 'suresh.m@gmail.com',
    password: 'user123',
    role: 'Farmer',
    status: 'active',
    district: 'Kattappana, Idukki',
    location: 'Kattappana, Idukki',
    phone: '+91 94471 22334',
    bio: 'Cardamom Cultivator with 12 acres in Kattappana.',
    isVerified: true,
  },
  {
    name: 'Devika Raj',
    username: 'devika_r',
    email: 'devika.raj@yahoo.com',
    password: 'user123',
    role: 'Farmer',
    status: 'active',
    district: 'Vandiperiyar, Idukki',
    location: 'Vandiperiyar, Idukki',
    phone: '+91 98460 55667',
    bio: 'Organic planter specializing in Vazhukka variety.',
    isVerified: true,
  },
  {
    name: 'Dr. Ramesh Nambiar',
    username: 'dr_ramesh',
    email: 'dr.ramesh@cardora.com',
    password: 'user123',
    role: 'Expert',
    status: 'active',
    district: 'Santhanpara, Idukki',
    location: 'Santhanpara, Idukki',
    phone: '+91 94471 23456',
    bio: 'Cardamom Agronomy & Soil Pathology Specialist.',
    isVerified: true,
  },
  {
    name: 'Anand Kumar',
    username: 'anand_k',
    email: 'anand.kumar@gmail.com',
    password: 'user123',
    role: 'Investor',
    status: 'active',
    district: 'Santhanpara, Idukki',
    location: 'Santhanpara, Idukki',
    phone: '+91 94952 88990',
    bio: 'Agri-Tech investor supporting high-altitude shade farming.',
    isVerified: true,
  },
  {
    name: 'Mathew Joseph',
    username: 'mathew_j',
    email: 'mathew.j@gmail.com',
    password: 'user123',
    role: 'Farmer',
    status: 'active',
    district: 'Nedumkandam, Idukki',
    location: 'Nedumkandam, Idukki',
    phone: '+91 94473 11223',
    bio: 'High yield exporter & estate owner.',
    isVerified: true,
  },
  {
    name: 'Priya Nair',
    username: 'priya_nair',
    email: 'priya.nair@outlook.com',
    password: 'user123',
    role: 'Farmer',
    status: 'active',
    district: 'Munnar, Idukki',
    location: 'Munnar, Idukki',
    phone: '+91 98471 44556',
    bio: 'Munnar mist plantation manager.',
    isVerified: true,
  },
];

const seedUsers = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cardora';
  console.log('Connecting to database:', mongoUri.split('@')[1] || mongoUri);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    for (const u of sampleUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
        console.log(`✅ Seeded DB User: ${u.name} (${u.role})`);
      } else {
        console.log(`ℹ️ Existing DB User: ${u.name}`);
      }
    }

    console.log('🎉 SUCCESS: All platform users are seeded into MongoDB database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
    process.exit(1);
  }
};

seedUsers();
