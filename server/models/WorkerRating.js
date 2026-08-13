const mongoose = require('mongoose');

const workerRatingSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    workerId: {
      type: String,
      required: true,
    },
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
    date: {
      type: String,
      required: true,
    },
    workQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    teamwork: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    productivity: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    overallRating: {
      type: Number,
      required: true,
      default: 5.0,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkerRating', workerRatingSchema);
