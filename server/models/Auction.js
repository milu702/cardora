const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Auction title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: [true, 'Plantation reference is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
    },
    location: {
      type: String,
      default: 'Idukki, Kerala',
    },
    district: {
      type: String,
      default: 'Idukki',
    },
    plantationType: {
      type: String,
      default: 'Cardamom Plantation',
    },
    areaAcres: {
      type: Number,
      default: 5.5,
    },
    estimatedYieldKg: {
      type: Number,
      default: 1200,
    },
    grade: {
      type: String,
      default: 'AGEB (8mm Extra Bold)',
    },
    images: [
      {
        type: String,
      },
    ],
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [1000, 'Starting price must be at least ₹1,000'],
    },
    currentBid: {
      type: Number,
      required: true,
    },
    minIncrement: {
      type: Number,
      default: 1000,
      min: [500, 'Minimum increment must be at least ₹500'],
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    highestBidderMasked: {
      type: String,
      default: null,
    },
    biddersCount: {
      type: Number,
      default: 0,
    },
    totalBidsCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Auction start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Auction end date is required'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'SCHEDULED', 'LIVE', 'ENDING_SOON', 'COMPLETED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING_APPROVAL',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    aiInsight: {
      recommendedMinPrice: Number,
      recommendedMaxPrice: Number,
      expectedDemand: {
        type: String,
        enum: ['High', 'Moderate', 'Steady', 'Very High'],
        default: 'High',
      },
      marketTrend: {
        type: String,
        default: '↗ Favorable Demand',
      },
      reasoning: String,
      generatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

auctionSchema.index({ status: 1, endDate: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ plantation: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
