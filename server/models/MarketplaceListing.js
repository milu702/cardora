const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerName: { type: String },
    ownerEmail: { type: String },
    ownerPhone: { type: String },
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: 'Prime Organic Cardamom Plot in Western Ghats, Kerala.',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
    },
    price: {
      type: String,
      required: [true, 'Price is required'],
    },
    type: {
      type: String,
      enum: ['sale', 'lease'],
      default: 'lease',
    },
    roi: {
      type: String,
      default: '24%',
    },
    healthScore: {
      type: Number,
      default: 94,
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'sold', 'leased'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
