const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: '',
      select: false,
    },
    googleId: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    hasCustomPhoto: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Idukki, Kerala',
    },
    district: {
      type: String,
      default: 'Idukki, Kerala',
    },
    bio: {
      type: String,
      default: 'Cardamom cultivator',
    },
    role: {
      type: String,
      enum: ['Farmer', 'Expert', 'Investor', 'User', 'planter', 'admin'],
      default: 'Farmer',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
