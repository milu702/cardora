const mongoose = require('mongoose');

const iotSensorSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    plantationName: {
      type: String,
      required: true,
    },
    plantationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
    },
    ownerName: {
      type: String,
      default: 'Cardamom Farmer',
    },
    district: {
      type: String,
      default: 'Idukki, Kerala',
    },
    moisture: {
      type: Number,
      default: 72,
    },
    temperature: {
      type: Number,
      default: 23,
    },
    humidity: {
      type: Number,
      default: 78,
    },
    status: {
      type: String,
      enum: ['active', 'warning', 'offline'],
      default: 'active',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('IoTSensor', iotSensorSchema);
