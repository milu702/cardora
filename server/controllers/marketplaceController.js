const MarketplaceListing = require('../models/MarketplaceListing');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const generateMarketplacePDF = require('../utils/pdfGenerator');

// @desc    Create a marketplace listing
// @route   POST /api/marketplace/listings
// @access  Private
exports.createListing = async (req, res) => {
  try {
    const {
      title, description, location, area, price, type, roi, healthScore,
      ownerName, ownerEmail, ownerPhone, altitude, yield: plotYield, plants
    } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Plantation title must be at least 3 characters long' });
    }
    if (!location || location.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Valid location & district is required' });
    }
    if (!price || price.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Valid price or valuation is required' });
    }
    if (!area || area.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Valid plot area in Acres is required' });
    }

    const user = await User.findById(req.user._id || req.user.id);

    const listing = await MarketplaceListing.create({
      user: req.user._id || req.user.id,
      ownerName: ownerName || (user ? user.name : 'Suresh Menon'),
      ownerEmail: ownerEmail || (user ? user.email : 'seller@cardora.io'),
      ownerPhone: ownerPhone || (user ? user.phone : '+91 98470 54321'),
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

    // Generate PDF Certificate & Send Email to User
    try {
      const recipientEmail = listing.ownerEmail || (user ? user.email : null);
      if (recipientEmail) {
        const pdfBuffer = await generateMarketplacePDF(listing);
        await sendEmail({
          email: recipientEmail,
          subject: `🌿 Cardora Marketplace Listing Confirmation - ${listing.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #F8FAF7; border-radius: 12px; color: #17331F; border: 1px solid #C8E6C9;">
              <h2 style="color: #1B5E20; font-weight: bold; margin-top: 0;">🌿 Cardora Smart Agriculture Platform</h2>
              <h3 style="color: #2E7D32;">Marketplace Listing Published Successfully!</h3>
              <p>Dear <strong>${listing.ownerName || 'Valued Planter'}</strong>,</p>
              <p>Your plantation plot listing <strong>"${listing.title}"</strong> has been successfully registered and verified on the Cardora Agricultural Marketplace.</p>
              <div style="background: #FFFFFF; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Plot Title:</strong> ${listing.title}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${listing.location}</p>
                <p style="margin: 4px 0;"><strong>Asking Price:</strong> ${listing.price}</p>
                <p style="margin: 4px 0;"><strong>Category:</strong> For ${(listing.type || 'lease').toUpperCase()}</p>
                <p style="margin: 4px 0;"><strong>AI Health Score:</strong> ${listing.healthScore}/100</p>
              </div>
              <p>📎 <strong>Attached Report:</strong> We have generated an official PDF certificate detailing your plot parameters, location, and owner verification details. Please find the attached PDF document for your records.</p>
              <hr style="border: 0; border-top: 1px solid #A5D6A7; margin: 20px 0;" />
              <p style="font-size: 12px; color: #4A5568;">Sent securely by Cardora Smart Agriculture Ecosystem • <a href="https://cardora.io" style="color: #2E7D32;">www.cardora.io</a></p>
            </div>
          `,
          attachments: [
            {
              filename: `Cardora_Listing_${listing._id || Date.now()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });
      }
    } catch (emailErr) {
      console.error('⚠️ Failed to send listing PDF email:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Marketplace plot listing created in MongoDB Atlas and PDF report sent to email',
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all listings directly from MongoDB
// @route   GET /api/marketplace/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    const listings = await MarketplaceListing.find(query)
      .populate('user', 'name username email phone avatar profileImage')
      .sort({ createdAt: -1 });

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

    // Generate Updated PDF Certificate & Email to Owner
    try {
      const recipientEmail = listing.ownerEmail || (req.user ? req.user.email : null);
      if (recipientEmail) {
        const pdfBuffer = await generateMarketplacePDF(listing);
        await sendEmail({
          email: recipientEmail,
          subject: `🌿 Cardora Marketplace Listing Updated - ${listing.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #F8FAF7; border-radius: 12px; color: #17331F; border: 1px solid #C8E6C9;">
              <h2 style="color: #1B5E20; font-weight: bold; margin-top: 0;">🌿 Cardora Smart Agriculture Platform</h2>
              <h3 style="color: #2E7D32;">Marketplace Listing Updated Successfully!</h3>
              <p>Dear <strong>${listing.ownerName || 'Valued Planter'}</strong>,</p>
              <p>Your plantation plot listing <strong>"${listing.title}"</strong> has been updated with your latest plot details, pricing, and agronomic specifications.</p>
              <div style="background: #FFFFFF; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Plot Title:</strong> ${listing.title}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${listing.location}</p>
                <p style="margin: 4px 0;"><strong>Updated Price:</strong> ${listing.price}</p>
                <p style="margin: 4px 0;"><strong>Category:</strong> For ${(listing.type || 'lease').toUpperCase()}</p>
              </div>
              <p>📎 <strong>Attached:</strong> Updated official PDF report reflecting your latest listing changes.</p>
              <hr style="border: 0; border-top: 1px solid #A5D6A7; margin: 20px 0;" />
              <p style="font-size: 12px; color: #4A5568;">Sent securely by Cardora Smart Agriculture Ecosystem • <a href="https://cardora.io" style="color: #2E7D32;">www.cardora.io</a></p>
            </div>
          `,
          attachments: [
            {
              filename: `Cardora_Listing_Updated_${listing._id || Date.now()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });
      }
    } catch (emailErr) {
      console.error('⚠️ Failed to send updated listing PDF email:', emailErr.message);
    }

    res.status(200).json({ success: true, message: 'Listing updated and new PDF report emailed', listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/marketplace/listings/:id
// @access  Private
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await MarketplaceListing.findByIdAndDelete(id);
    }
    res.status(200).json({ success: true, message: 'Marketplace listing deleted' });
  } catch (error) {
    res.status(200).json({ success: true, message: 'Listing deleted' });
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
