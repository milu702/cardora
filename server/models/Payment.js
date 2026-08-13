const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },
    workerId: {
      type: String,
      default: '',
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      default: null,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    type: {
      type: String,
      enum: ['Salary', 'Advance', 'Bonus', 'Daily Wage', 'Weekly Wage', 'Monthly Settlement', 'Penalty'],
      default: 'Salary',
    },
    paymentType: {
      type: String,
      enum: ['Salary', 'Advance', 'Bonus', 'Daily Wage', 'Weekly Wage', 'Monthly Settlement', 'Penalty'],
      default: 'Daily Wage',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'],
      default: 'Cash',
    },
    transactionId: {
      type: String,
      default: '',
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
      enum: ['Paid', 'Pending', 'Completed', 'Failed'],
      default: 'Paid',
    },
    remarks: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: 'Cardamom plantation payment',
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
