const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    plantationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      default: null,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    address: {
      type: String,
      default: '',
    },
    workType: {
      type: String,
      default: 'Capsule Harvesting',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    district: {
      type: String,
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
      default: 700,
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
      default: 4.5,
    },
    totalRatingsCount: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    currentEmployer: {
      type: String,
      default: 'Cardora Plantation',
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
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    bio: {
      type: String,
      default: 'Plantation worker skilled in cardamom harvesting and field maintenance.',
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
