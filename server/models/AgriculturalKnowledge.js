const mongoose = require('mongoose');

const agriculturalKnowledgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    crop: {
      type: String,
      default: 'Cardamom',
    },
    category: {
      type: String,
      enum: ['Pest', 'Disease', 'Nutrient Deficiency', 'Environmental Stress', 'Management', 'Healthy'],
      default: 'Disease',
    },
    condition: {
      type: String,
      required: true,
      index: true,
    },
    scientificName: {
      type: String,
      default: '',
    },
    symptoms: {
      type: [String],
      default: [],
    },
    causes: {
      type: [String],
      default: [],
    },
    organicTreatment: {
      type: [String],
      default: [],
    },
    chemicalControl: {
      type: [String],
      default: [],
    },
    prevention: {
      type: [String],
      default: [],
    },
    immediateActions: {
      type: [String],
      default: [],
    },
    followUpActions: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      default: 'ICAR–Indian Institute of Spices Research',
    },
    sourceUrl: {
      type: String,
      default: 'https://spices.res.in',
    },
    lastVerified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AgriculturalKnowledge', agriculturalKnowledgeSchema);
