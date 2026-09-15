const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      default: 'user',
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: { type: String },
        type: { type: String, default: 'image' },
        name: { type: String },
      },
    ],
    contextUsed: {
      usePlantationData: { type: Boolean, default: false },
      plantationId: { type: String },
      plantationName: { type: String },
      soilMoisture: { type: Number },
      ph: { type: Number },
      npk: {
        n: { type: Number },
        p: { type: Number },
        k: { type: Number },
      },
      weather: {
        temp: { type: Number },
        humidity: { type: Number },
        rain: { type: Number },
        district: { type: String },
      },
    },
    structuredData: {
      diseaseRisk: { type: String },
      riskScore: { type: Number },
      weatherRisk: { type: String },
      plantationHealthScore: { type: Number },
      recommendations: [{ type: String }],
      suggestedActions: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AiMessage', aiMessageSchema);
