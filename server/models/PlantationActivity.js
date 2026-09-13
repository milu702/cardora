const mongoose = require('mongoose');

const plantationActivitySchema = new mongoose.Schema(
  {
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        'Fertilizer application',
        'Irrigation',
        'Weeding',
        'Mulching',
        'Pest control',
        'Disease treatment',
        'Shade management',
        'Harvesting',
        'Cleaning',
        'Soil testing',
        'Plant inspection',
        'Other',
      ],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    block: {
      type: String,
      default: 'Main Block',
    },
    description: {
      type: String,
      required: true,
    },
    materialsUsed: {
      type: String,
      default: '',
    },
    quantity: {
      type: String,
      default: '',
    },
    workersInvolved: {
      type: Number,
      default: 0,
    },
    weatherCondition: {
      type: String,
      default: 'Clear',
    },
    notes: {
      type: String,
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

plantationActivitySchema.index({ plantation: 1, date: -1 });
plantationActivitySchema.index({ supervisor: 1, date: -1 });
plantationActivitySchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('PlantationActivity', plantationActivitySchema);
