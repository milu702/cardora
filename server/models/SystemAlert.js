const mongoose = require('mongoose');

const systemAlertSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    title: {
      type: String,
      required: true,
    },
    plantationName: {
      type: String,
      default: 'Kattappana Estate',
    },
    farmerName: {
      type: String,
      default: 'Cardamom Farmer',
    },
    recommendation: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemAlert', systemAlertSchema);
