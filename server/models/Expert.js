const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: 'Cardamom Soil & Disease Pathology',
    },
    experienceYears: {
      type: Number,
      default: 8,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    assignedFarmersCount: {
      type: Number,
      default: 15,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expert', expertSchema);
