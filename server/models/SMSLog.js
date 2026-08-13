const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema(
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
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Attendance', 'Wage', 'Payment', 'WorkAssignment'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Sent', 'Failed', 'Simulated'],
      default: 'Sent',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SMSLog', smsLogSchema);
