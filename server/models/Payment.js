const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['Daily Wage', 'Weekly Wage', 'Monthly Settlement', 'Bonus', 'Penalty'],
      default: 'Daily Wage',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Cash'],
      default: 'UPI',
    },
    upiReference: {
      type: String,
      default: function () {
        return 'UPI' + Math.floor(100000000000 + Math.random() * 900000000000);
      },
    },
    receiptNumber: {
      type: String,
      unique: true,
      default: function () {
        return 'RCP-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
      },
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed',
    },
    notes: {
      type: String,
      default: 'Cardamom harvest payment',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
