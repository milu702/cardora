const mongoose = require('mongoose');

const expertConsultationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
    },
    title: {
      type: String,
      required: [true, 'Please provide a consultation title'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Plant Pathology & Diseases',
    },
    questionText: {
      type: String,
      required: [true, 'Please describe your query in detail'],
    },
    image: {
      type: String,
      default: '',
    },
    voiceNoteUrl: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['en', 'ml'],
      default: 'en',
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'answered', 'resolved'],
      default: 'open',
    },
    expertAnswer: {
      answerText: { type: String, default: '' },
      answeredBy: { type: String, default: 'Cardora Agronomist Panel' },
      answeredAt: { type: Date },
      recommendedRemedy: { type: String, default: '' },
      organicAdvice: { type: String, default: '' },
    },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      feedback: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ExpertConsultation', expertConsultationSchema);
