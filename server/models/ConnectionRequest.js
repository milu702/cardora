const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
    note: {
      type: String,
      default: '',
    },
    roleType: {
      type: String,
      enum: ['owner_worker', 'owner_contractor', 'contractor_worker'],
      default: 'owner_worker',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
