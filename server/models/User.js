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
      enum: ['Farmer', 'Expert', 'Investor', 'User', 'planter', 'admin', 'Plantation Owner', 'Labor Contractor', 'Worker', 'Supervisor', 'Admin'],
      default: 'Farmer',
    },
    assignedPlantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'deactivated'],
      default: 'active',
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpire: {
      type: Date,
      select: false,
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    experience: {
      type: String,
      default: '10+ Years Cardamom & Spice Cultivation',
    },
    skills: {
      type: [String],
      default: ['Organic Cardamom Farming', 'Drip & Sprinkler Irrigation', 'Azhukal Disease Control', 'Soil NPK Optimization'],
    },
    certifications: {
      type: [String],
      default: ['Certified Spice Cultivator (Spices Board India)', 'Organic Agriculture Specialist'],
    },
    education: {
      type: String,
      default: 'B.Sc. Agriculture / Horticulture',
    },
    organization: {
      type: String,
      default: 'Cardamom Growers Association, Idukki',
    },
    privacy: {
      allowMessagesFrom: { type: String, enum: ['everyone', 'following', 'none'], default: 'everyone' },
      viewPlantations: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
      viewContact: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
      viewFollowers: { type: String, enum: ['public', 'private'], default: 'public' },
      isPrivateAccount: { type: Boolean, default: false },
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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
