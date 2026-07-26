const mongoose = require('mongoose');

const plantationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a plantation name'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Idukki, Kerala',
    },
    area: {
      type: Number,
      required: [true, 'Please specify plantation area in acres'],
    },
    plantsCount: {
      type: Number,
      default: 1500,
    },
    plantAge: {
      type: String,
      default: '3 Years',
    },
    variety: {
      type: String,
      default: 'Malabar',
    },
    soilPh: {
      type: Number,
      default: 6.2,
    },
    npk: {
      n: { type: Number, default: 140 },
      p: { type: Number, default: 45 },
      k: { type: Number, default: 180 },
    },
    moisture: {
      type: Number,
      default: 72,
    },
    weather: {
      temp: { type: String, default: '22°C' },
      condition: { type: String, default: 'Humid High Altitude Breeze' },
      humidity: { type: String, default: '78%' },
    },
    images: [{ type: String }],
    healthScore: {
      type: Number,
      default: 94,
    },
    history: {
      type: String,
      default: 'Irrigated and soil fertilized recently',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Plantation', plantationSchema);
