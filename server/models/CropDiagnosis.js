const mongoose = require('mongoose');

const cropDiagnosisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: false,
    },
    plotId: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    crop: {
      type: String,
      default: 'Cardamom',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    scientificName: {
      type: String,
      default: '',
    },
    diagnosisType: {
      type: String,
      default: 'Botanical Assessment',
    },
    confidence: {
      type: Number,
      default: null,
    },
    confidenceAvailable: {
      type: Boolean,
      default: false,
    },
    severity: {
      type: String,
      default: 'Undetermined',
    },
    imageQuality: {
      type: String,
      default: 'Good',
    },
    visualEvidence: {
      type: [String],
      default: [],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    possibleCauses: {
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
    uncertainty: {
      type: String,
      default: '',
    },
    additionalImageNeeded: {
      type: Boolean,
      default: false,
    },
    explanation: {
      type: String,
      default: '',
    },
    affectedRegions: [
      {
        label: { type: String, default: '' },
        box: { type: [Number], default: [] }, // [x, y, width, height] normalized
      },
    ],
    knowledgeSource: {
      type: String,
      default: 'Verified Agricultural Reference',
    },
    knowledgeSourceUrl: {
      type: String,
      default: '',
    },
    aiProvider: {
      type: String,
      default: 'Google Gemini Vision',
    },
    farmContext: {
      plantationName: { type: String, default: '' },
      plotName: { type: String, default: '' },
      soilMoisture: { type: String, default: 'N/A' },
      soilPh: { type: String, default: 'N/A' },
      npk: { type: String, default: 'N/A' },
      weatherTemp: { type: String, default: 'N/A' },
      weatherHumidity: { type: String, default: 'N/A' },
      weatherRain: { type: String, default: 'N/A' },
      location: { type: String, default: 'Idukki, Kerala' },
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'Monitoring', 'Escalated'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CropDiagnosis', cropDiagnosisSchema);
