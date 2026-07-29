const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const seedAdmin = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cardora';
  console.log('Connecting to database:', mongoUri.split('@')[1] || mongoUri);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@cardora.com';
    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        username: 'admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        location: 'Idukki, Kerala',
        district: 'Idukki, Kerala',
        bio: 'Cardora Platform Master Administrator',
        isVerified: true,
      });
      console.log('🎉 SUCCESS: Admin account created in MongoDB database!');
      console.log('   Email: admin@cardora.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    } else {
      admin.role = 'admin';
      admin.password = 'admin123'; // ensure password is set to admin123
      await admin.save();
      console.log('🎉 SUCCESS: Admin account updated in MongoDB database!');
      console.log('   Email: admin@cardora.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
