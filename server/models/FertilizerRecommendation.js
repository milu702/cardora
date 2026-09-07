const mongoose = require('mongoose');

const fertilizerRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      index: true,
    },
    plantationName: {
      type: String,
      default: 'Cardamom Estate',
    },
    crop: {
      type: String,
      default: 'cardamom',
    },
    soilData: {
      nitrogen: { type: Number, required: true },
      phosphorus: { type: Number, required: true },
      potassium: { type: Number, required: true },
      ph: { type: Number, required: true },
      moisture: { type: Number, required: true },
    },
    weatherData: {
      temperature: { type: Number, required: true },
      humidity: { type: Number, required: true },
      rainfall: { type: Number, required: true },
    },
    prediction: {
      fertilizer: { type: String, required: true },
      confidence: { type: Number, required: true },
      nutrientPriority: [{ type: String }],
      soilStatus: {
        nitrogen: String,
        phosphorus: String,
        potassium: String,
        ph: String,
        moisture: String,
      },
      weatherStatus: {
        temperature: Number,
        humidity: Number,
        rainfall: Number,
      },
      recommendation: { type: String, required: true },
      weatherAdvice: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

fertilizerRecommendationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('FertilizerRecommendation', fertilizerRecommendationSchema);
