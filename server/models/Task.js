const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    deadline: {
      type: Date,
      required: true,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
    },
    plantationName: {
      type: String,
      default: 'Vandanmedu Green Estate',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    requiredWorkersCount: {
      type: Number,
      default: 5,
    },
    dailyWage: {
      type: Number,
      default: 850,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'completed', 'cancelled'],
      default: 'pending',
    },
    photos: [
      {
        type: String,
      },
    ],
    progressUpdates: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String, default: 'Worker' },
        text: { type: String, required: true },
        photos: [{ type: String }],
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
