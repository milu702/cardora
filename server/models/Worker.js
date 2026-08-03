const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    workerId: {
      type: String,
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    age: {
      type: Number,
      default: 28,
    },
    district: {
      type: String,
      required: true,
      default: 'Idukki',
    },
    village: {
      type: String,
      default: 'Vandanmedu',
    },
    phone: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['Malayalam', 'Tamil', 'English'],
    },
    experience: {
      type: String,
      default: '5 Years Cardamom Harvesting',
    },
    skills: {
      type: [String],
      default: ['Capsule Harvesting', 'Soil Tilling', 'Drip Irrigation', 'Weed Control'],
    },
    specializations: {
      type: [String],
      default: ['Cardamom Picking', 'Shade Management', 'Organic Spraying'],
    },
    dailyWage: {
      type: Number,
      default: 850,
    },
    availability: {
      type: String,
      enum: ['Available Today', 'Available Next Week', 'On Duty', 'Busy', 'Offline'],
      default: 'Available Today',
    },
    preferredDistricts: {
      type: [String],
      default: ['Idukki', 'Wayanad', 'Pathanamthitta'],
    },
    currentStatus: {
      type: String,
      enum: ['Available for Hire', 'On Active Task', 'Inactive'],
      default: 'Available for Hire',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    totalRatingsCount: {
      type: Number,
      default: 12,
    },
    completedJobs: {
      type: Number,
      default: 34,
    },
    currentEmployer: {
      type: String,
      default: 'Open for Hire',
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
    certificates: {
      type: [String],
      default: ['Certified Plantation Worker - Spices Board', 'Safety & Pesticide Handling'],
    },
    emergencyContact: {
      name: { type: String, default: 'Family Contact' },
      phone: { type: String, default: '+91 9876543210' },
      relation: { type: String, default: 'Spouse' },
    },
    bio: {
      type: String,
      default: 'Experienced cardamom plantation specialist skilled in selective capsule harvesting and shade pruning.',
    },
    photo: {
      type: String,
      default: '',
    },
    locationCoords: {
      lat: { type: Number, default: 9.7891 },
      lng: { type: Number, default: 77.1685 },
      lastUpdated: { type: Date, default: Date.now },
    },
    contractorTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contractor',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Worker', workerSchema);
