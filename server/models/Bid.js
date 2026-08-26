const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
      index: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bidderMasked: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isHighest: {
      type: Boolean,
      default: true,
    },
    placedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bidSchema.index({ auction: 1, amount: -1 });

module.exports = mongoose.model('Bid', bidSchema);
