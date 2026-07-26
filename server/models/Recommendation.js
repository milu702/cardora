const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
    },
    soilPh: {
      type: Number,
      required: true,
    },
    moisture: {
      type: Number,
      required: true,
    },
    npk: {
      n: Number,
      p: Number,
      k: Number,
    },
    healthScore: {
      type: Number,
      required: true,
    },
    yieldPrediction: {
      type: String,
      required: true,
    },
    diseaseRisk: {
      type: String,
      required: true,
    },
    fertilizerAdvice: {
      type: String,
      required: true,
    },
    irrigationSchedule: {
      type: String,
      required: true,
    },
    weatherSummary: {
      type: String,
      default: 'Idukki High Altitude 22°C, 78% Humidity',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
