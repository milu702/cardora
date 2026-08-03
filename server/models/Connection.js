const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleType: {
      type: String,
      enum: ['owner_worker', 'owner_contractor', 'contractor_worker'],
      default: 'owner_worker',
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'disconnected'],
      default: 'active',
    },
    connectedSince: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate connections between same pair of users
connectionSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
