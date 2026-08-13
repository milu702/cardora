const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    workerId: {
      type: String,
      default: '',
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: true,
    },
    plantationName: {
      type: String,
      default: 'Cardora Estate',
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Half Day', 'Absent', 'Leave'],
      default: 'Present',
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    overtimeAmount: {
      type: Number,
      default: 0,
    },
    workType: {
      type: String,
      default: 'General Harvesting',
    },
    remarks: {
      type: String,
      default: '',
    },
    markedBy: {
      type: String,
      default: 'Supervisor',
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    workingHours: {
      type: Number,
      default: 8,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
