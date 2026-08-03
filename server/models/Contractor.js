const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contractorId: {
      type: String,
      required: true,
      unique: true,
    },
    registrationNumber: {
      type: String,
      default: 'KLA-LAB-2025-884',
    },
    district: {
      type: String,
      required: true,
      default: 'Idukki',
    },
    phone: {
      type: String,
      default: '',
    },
    teamSize: {
      type: Number,
      default: 25,
    },
    managedWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
      },
    ],
    preferredDistricts: {
      type: [String],
      default: ['Idukki', 'Wayanad', 'Palakkad'],
    },
    specialization: {
      type: String,
      default: 'Large Scale Cardamom Plantation Workforce & Harvest Crew',
    },
    dailyRatesRange: {
      min: { type: Number, default: 800 },
      max: { type: Number, default: 1200 },
    },
    availabilityStatus: {
      type: String,
      enum: ['Available for Contracts', 'Fully Booked', 'Offline'],
      default: 'Available for Contracts',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Unverified', 'Rejected'],
      default: 'Verified',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    completedProjects: {
      type: Number,
      default: 48,
    },
    bio: {
      type: String,
      default: 'Licensed labor contractor delivering trained, skilled workforce for cardamom estates across Idukki & High Ranges.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contractor', contractorSchema);
