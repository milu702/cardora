const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      default: null,
    },
    plantationName: {
      type: String,
      default: 'Vandanmedu Green Estate',
    },
    date: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    checkInLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: 'Vandanmedu Plot 4, Idukki' },
    },
    checkOutLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    workingHours: {
      type: Number,
      default: 8,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
