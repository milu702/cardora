const mongoose = require('mongoose');

const plantationVisitSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarketplaceListing',
      default: null,
    },
    plotTitle: {
      type: String,
      required: true,
    },
    plotLocation: {
      type: String,
      default: 'Idukki, Kerala',
    },
    visitDate: {
      type: String,
      required: true,
    },
    visitTime: {
      type: String,
      required: true,
    },
    visitorName: {
      type: String,
      required: true,
    },
    visitorPhone: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Declined', 'Completed'],
      default: 'Pending',
    },
    ownerNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

plantationVisitSchema.index({ owner: 1, status: 1, createdAt: -1 });
plantationVisitSchema.index({ visitor: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('PlantationVisit', plantationVisitSchema);
