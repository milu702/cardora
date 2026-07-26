const MarketplaceListing = require('../models/MarketplaceListing');
const User = require('../models/User');

// @desc    Create a marketplace listing
// @route   POST /api/marketplace/listings
// @access  Private
exports.createListing = async (req, res) => {
  try {
    const { title, description, location, area, price, type, roi, healthScore } = req.body;

    if (!title || !location || !price) {
      return res.status(400).json({ success: false, message: 'Title, location, and price are required' });
    }

    const user = await User.findById(req.user._id || req.user.id);

    const listing = await MarketplaceListing.create({
      user: req.user._id || req.user.id,
      ownerName: user ? user.name : 'Suresh Menon',
      ownerEmail: user ? user.email : 'seller@cardora.io',
      ownerPhone: user ? user.phone : '+91 98470 54321',
      title,
      description: description || 'Prime Cardamom plantation plot in Western Ghats, Idukki.',
      location,
      area: area || '5 Acres',
      price,
      type: type || 'lease',
      roi: roi || '24%',
      healthScore: Number(healthScore) || 94,
      images: req.files ? req.files.map((f) => f.path || f.secure_url) : [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'
      ],
    });

    if (user) {
      user.marketplaceListings += 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Marketplace plot listing created in MongoDB Atlas',
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all listings
// @route   GET /api/marketplace/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const { search, type, minPrice, maxPrice } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }

    const listings = await MarketplaceListing.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single listing
// @route   GET /api/marketplace/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.status(200).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update listing
// @route   PUT /api/marketplace/listings/:id
// @access  Private
exports.updateListing = async (req, res) => {
  try {
    let listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    listing = await MarketplaceListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Listing updated', listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/marketplace/listings/:id
// @access  Private
exports.deleteListing = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    await listing.deleteOne();
    res.status(200).json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Contact seller
// @route   POST /api/marketplace/listings/:id/contact
// @access  Public
exports.contactSeller = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      message: `Contact request sent to owner ${listing.ownerName}`,
      sellerContact: {
        name: listing.ownerName,
        email: listing.ownerEmail,
        phone: listing.ownerPhone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
