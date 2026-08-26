const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Plantation = require('../models/Plantation');
const Notification = require('../models/Notification');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini AI
const aiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
const aiClient = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

// Helper to generate masked buyer ID e.g. "Buyer #A82"
const getMaskedBidderId = (userId) => {
  const str = String(userId || 'ANON');
  const code = str.substring(str.length - 4).toUpperCase();
  return `Buyer #${code}`;
};

// @desc    Get all auctions with filters, search, tabs, & sorting
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    const {
      search,
      location,
      plantationType,
      minPrice,
      maxPrice,
      statusTab,
      sortBy,
    } = req.query;

    let query = {};

    // Auto-update status for expired auctions
    const now = new Date();
    await Auction.updateMany(
      { endDate: { $lte: now }, status: { $in: ['LIVE', 'ENDING_SOON'] } },
      { $set: { status: 'COMPLETED' } }
    );
    await Auction.updateMany(
      { endDate: { $lte: new Date(now.getTime() + 5 * 60 * 1000) }, endDate: { $gt: now }, status: 'LIVE' },
      { $set: { status: 'ENDING_SOON' } }
    );

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { grade: { $regex: search, $options: 'i' } },
      ];
    }

    // Location filter
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Plantation type filter
    if (plantationType && plantationType !== 'all') {
      query.plantationType = { $regex: plantationType, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.currentBid = {};
      if (minPrice) query.currentBid.$gte = Number(minPrice);
      if (maxPrice) query.currentBid.$lte = Number(maxPrice);
    }

    // Status Tab filter
    if (statusTab === 'live') {
      query.status = { $in: ['LIVE', 'ENDING_SOON'] };
    } else if (statusTab === 'starting_soon') {
      query.status = 'SCHEDULED';
    } else if (statusTab === 'ending_soon') {
      query.status = 'ENDING_SOON';
    } else if (statusTab === 'completed') {
      query.status = 'COMPLETED';
    } else if (statusTab === 'my_auctions' && req.user) {
      query.seller = req.user._id;
    } else if (!statusTab || statusTab === 'all') {
      query.status = { $ne: 'DRAFT' };
    }

    // Sorting logic
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'endingSoon') {
      sortOptions = { endDate: 1 };
    } else if (sortBy === 'highestBid') {
      sortOptions = { currentBid: -1 };
    } else if (sortBy === 'lowestBid') {
      sortOptions = { currentBid: 1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const auctions = await Auction.find(query)
      .populate('seller', 'name email district avatar')
      .populate('plantation', 'name district location areaAcres cardamomVariety')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: auctions.length,
      auctions,
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single auction details with bid timeline
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email district avatar location phone')
      .populate('plantation');

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Auto update status if expired
    const now = new Date();
    if (auction.endDate <= now && (auction.status === 'LIVE' || auction.status === 'ENDING_SOON')) {
      auction.status = 'COMPLETED';
      await auction.save();
    } else if (
      auction.endDate <= new Date(now.getTime() + 5 * 60 * 1000) &&
      auction.endDate > now &&
      auction.status === 'LIVE'
    ) {
      auction.status = 'ENDING_SOON';
      await auction.save();
    }

    // Fetch bid history for this auction
    const bids = await Bid.find({ auction: auction._id })
      .sort({ amount: -1, placedAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      auction,
      bids,
    });
  } catch (error) {
    console.error('Error fetching auction by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new auction (Farmer)
// @route   POST /api/auctions
// @access  Private
exports.createAuction = async (req, res) => {
  try {
    const {
      plantationId,
      title,
      description,
      startingPrice,
      minIncrement,
      startDate,
      endDate,
      submitForApproval,
    } = req.body;

    const plantation = await Plantation.findById(plantationId);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    // Verify ownership
    if (plantation.owner && String(plantation.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only auction your own registered plantations' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days default

    const auctionStatus = submitForApproval ? 'PENDING_APPROVAL' : 'DRAFT';

    const auction = await Auction.create({
      title: title || `${plantation.name} Cardamom Auction`,
      description: description || `High yield cardamom plantation auction in ${plantation.district || 'Idukki'}.`,
      plantation: plantation._id,
      seller: req.user._id,
      location: plantation.location || `${plantation.district || 'Idukki'}, Kerala`,
      district: plantation.district || 'Idukki',
      plantationType: plantation.cardamomVariety || 'NJALLANI GREEN GOLD',
      areaAcres: plantation.areaAcres || 5.5,
      estimatedYieldKg: plantation.estimatedYieldKg || 1200,
      grade: plantation.grade || 'AGEB (8mm Extra Bold)',
      images: plantation.images && plantation.images.length > 0
        ? plantation.images
        : ['https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80'],
      startingPrice: Number(startingPrice) || 50000,
      currentBid: Number(startingPrice) || 50000,
      minIncrement: Number(minIncrement) || 1000,
      startDate: start,
      endDate: end,
      status: auctionStatus,
    });

    res.status(201).json({
      success: true,
      message: submitForApproval
        ? 'Auction submitted for Admin Approval successfully!'
        : 'Auction draft created successfully.',
      auction,
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Place bid on live auction (Real-Time atomic)
// @route   POST /api/auctions/:id/bid
// @access  Private
exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auctionId = req.params.id;
    const bidAmount = Number(amount);

    if (!bidAmount || isNaN(bidAmount)) {
      return res.status(400).json({ success: false, message: 'Invalid bid amount specified' });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Validation 1: Auction must be LIVE or ENDING_SOON
    const now = new Date();
    if (auction.endDate <= now || (auction.status !== 'LIVE' && auction.status !== 'ENDING_SOON')) {
      return res.status(400).json({ success: false, message: 'This auction has ended or is not currently active for bidding.' });
    }

    // Validation 2: Seller cannot bid on own auction
    if (String(auction.seller) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Plantation owners cannot place bids on their own auctions.' });
    }

    // Validation 3: Bid must meet current price + minimum increment
    const minRequiredBid = auction.currentBid + (auction.minIncrement || 1000);
    if (bidAmount < minRequiredBid) {
      return res.status(400).json({
        success: false,
        message: `Your bid of ₹${bidAmount.toLocaleString()} is below the minimum required bid of ₹${minRequiredBid.toLocaleString()}`,
      });
    }

    // Previous highest bidder to notify outbid
    const previousHighestBidder = auction.highestBidder;

    // Masked identity for bidder privacy
    const maskedId = getMaskedBidderId(req.user._id);

    // Atomic update on Auction document to avoid race conditions
    const updatedAuction = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        currentBid: { $lt: bidAmount },
        status: { $in: ['LIVE', 'ENDING_SOON'] },
      },
      {
        $set: {
          currentBid: bidAmount,
          highestBidder: req.user._id,
          highestBidderMasked: maskedId,
        },
        $inc: {
          totalBidsCount: 1,
        },
      },
      { new: true }
    );

    if (!updatedAuction) {
      return res.status(409).json({
        success: false,
        message: 'Another buyer placed a higher bid just before you! Please try again with a higher amount.',
      });
    }

    // Count unique bidders
    const uniqueBidders = await Bid.distinct('bidder', { auction: auctionId });
    if (!uniqueBidders.includes(String(req.user._id))) {
      updatedAuction.biddersCount = uniqueBidders.length + 1;
      await updatedAuction.save();
    }

    // Create Bid record
    const bidRecord = await Bid.create({
      auction: auctionId,
      bidder: req.user._id,
      bidderMasked: maskedId,
      amount: bidAmount,
      isHighest: true,
      placedAt: new Date(),
    });

    // Mark prior bids as not highest
    await Bid.updateMany(
      { auction: auctionId, _id: { $ne: bidRecord._id } },
      { $set: { isHighest: false } }
    );

    // Notify previous highest bidder if outbid
    if (previousHighestBidder && String(previousHighestBidder) !== String(req.user._id)) {
      await Notification.create({
        user: previousHighestBidder,
        title: '⚠️ Outbid Alert!',
        message: `You have been outbid on "${updatedAuction.title}". New highest bid: ₹${bidAmount.toLocaleString()}`,
        type: 'AUCTION_OUTBID',
        link: `/auctions/${auctionId}`,
      }).catch((e) => console.log('Outbid notification skipped:', e.message));
    }

    // Broadcast live Socket.IO update if Socket server attached to req.app
    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${auctionId}`).emit('new_bid', {
        auctionId,
        currentBid: updatedAuction.currentBid,
        highestBidderMasked: maskedId,
        biddersCount: updatedAuction.biddersCount,
        totalBidsCount: updatedAuction.totalBidsCount,
        newBid: {
          _id: bidRecord._id,
          amount: bidAmount,
          bidderMasked: maskedId,
          placedAt: bidRecord.placedAt,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `🎉 Bid of ₹${bidAmount.toLocaleString()} placed successfully!`,
      auction: updatedAuction,
      bid: bidRecord,
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Price Insight for plantation auction (Gemini AI)
// @route   POST /api/auctions/ai-price-insight
// @access  Private
exports.getAiPriceInsight = async (req, res) => {
  try {
    const { areaAcres, district, cardamomVariety, ageYears, soilPh } = req.body;

    const acres = Number(areaAcres) || 5.0;
    const dist = district || 'Idukki';
    const variety = cardamomVariety || 'Njallani Green Gold';

    let result;

    if (aiClient) {
      try {
        const prompt = `You are Cardora AI, an expert agricultural economist for cardamom plantation auctions in ${dist}, Kerala, India.
Given plantation details:
- Area: ${acres} Acres
- Variety: ${variety}
- District: ${dist}
- Age: ${ageYears || 6} years
- Soil pH: ${soilPh || 6.2}

Provide a JSON object with:
1. "recommendedMinPrice": estimated fair starting price integer in INR (e.g. 55000)
2. "recommendedMaxPrice": estimated maximum price integer in INR (e.g. 72000)
3. "expectedDemand": one of ["High", "Moderate", "Very High"]
4. "marketTrend": short string like "↗ Favorable Harvest Demand"
5. "reasoning": 2-sentence plain explanation for farmers.

Respond with ONLY raw JSON without markdown formatting.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text?.trim() || '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        result = JSON.parse(cleanJson);
      } catch (err) {
        console.warn('Gemini AI call failed, using fallback decision rules:', err.message);
      }
    }

    // Deterministic fallback if AI API is unconfigured or errors
    if (!result) {
      const baseRatePerAcre = 11000;
      const calcMin = Math.round(acres * baseRatePerAcre);
      const calcMax = Math.round(calcMin * 1.3);

      result = {
        recommendedMinPrice: calcMin,
        recommendedMaxPrice: calcMax,
        expectedDemand: acres > 4 ? 'Very High' : 'High',
        marketTrend: '↗ Favorable Cardamom Demand',
        reasoning: `Based on ${acres} acres of high-yield ${variety} in ${dist}, current Spices Board India auction trends show strong buyer interest for 8mm bold grades.`,
      };
    }

    res.status(200).json({
      success: true,
      insight: {
        ...result,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error generating AI price insight:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's auctions (Farmer Dashboard)
// @route   GET /api/auctions/my-auctions
// @access  Private
exports.getMyAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate('plantation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: auctions.length,
      auctions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin approve or reject auction
// @route   PUT /api/auctions/:id/approve
// @access  Private (Admin)
exports.adminApproveRejectAuction = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'approve', 'reject', 'suspend'
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (action === 'approve') {
      auction.status = 'LIVE';
    } else if (action === 'reject') {
      auction.status = 'REJECTED';
      auction.rejectionReason = reason || 'Does not meet plantation verification requirements.';
    } else if (action === 'suspend') {
      auction.status = 'CANCELLED';
    }

    await auction.save();

    res.status(200).json({
      success: true,
      message: `Auction status updated to ${auction.status}`,
      auction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed sample live auctions for working demonstration
// @route   POST /api/auctions/seed
// @access  Public
exports.seedSampleAuctions = async (req, res) => {
  try {
    const sampleAuctions = [
      {
        title: '🌿 Premium Idukki Cardamom Estate (5.5 Acres)',
        description: 'High-altitude organic cardamom plantation with mature Njallani Green Gold plants, automated drip irrigation, and high yield 8mm extra bold pods.',
        location: 'Kattappana, Idukki, Kerala',
        district: 'Idukki',
        plantationType: 'Njallani Green Gold',
        areaAcres: 5.5,
        estimatedYieldKg: 1450,
        grade: 'AGEB (8mm Extra Bold)',
        startingPrice: 50000,
        currentBid: 65000,
        minIncrement: 1000,
        highestBidderMasked: 'Buyer #A82',
        biddersCount: 12,
        totalBidsCount: 18,
        startDate: new Date(),
        endDate: new Date(Date.now() + 2 * 3600 * 1000 + 18 * 60 * 1000 + 43 * 1000), // 2h 18m 43s remaining
        status: 'LIVE',
        images: [
          'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
        ],
        aiInsight: {
          recommendedMinPrice: 55000,
          recommendedMaxPrice: 70000,
          expectedDemand: 'Very High',
          marketTrend: '↗ Favorable Spices Board Index',
          reasoning: 'Prime soil quality and high-density planting in Kattappana command a 20% premium over regional base prices.',
        },
      },
      {
        title: '🌱 High Yield Devikulam Cardamom Grove (8.0 Acres)',
        description: 'Spectacular canopy shade management with disease-resistant Vazhukka variety. Complete IoT soil moisture sensors pre-installed.',
        location: 'Devikulam, Idukki, Kerala',
        district: 'Idukki',
        plantationType: 'Vazhukka Special',
        areaAcres: 8.0,
        estimatedYieldKg: 2100,
        grade: 'AGB (7.5mm Bold)',
        startingPrice: 75000,
        currentBid: 88000,
        minIncrement: 2000,
        highestBidderMasked: 'Buyer #K14',
        biddersCount: 16,
        totalBidsCount: 24,
        startDate: new Date(),
        endDate: new Date(Date.now() + 4 * 60 * 1000 + 32 * 1000), // 4m 32s remaining -> ENDING SOON!
        status: 'ENDING_SOON',
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
        ],
        aiInsight: {
          recommendedMinPrice: 80000,
          recommendedMaxPrice: 95000,
          expectedDemand: 'High',
          marketTrend: '↗ Peak Demand',
          reasoning: 'Large acreage in Devikulam with active IoT telemetry commands high competition among premium spice exporters.',
        },
      },
      {
        title: '🌄 Wayanad High-Grade Spice Plantation (4.2 Acres)',
        description: 'Rich forest humus soil with inter-cropped black pepper and cardamom. Excellent access road and post-harvest drying yard.',
        location: 'Meppadi, Wayanad, Kerala',
        district: 'Wayanad',
        plantationType: 'Green Gold Hybrid',
        areaAcres: 4.2,
        estimatedYieldKg: 980,
        grade: 'AGS (Grinded Special)',
        startingPrice: 42000,
        currentBid: 42000,
        minIncrement: 1000,
        highestBidderMasked: null,
        biddersCount: 0,
        totalBidsCount: 0,
        startDate: new Date(Date.now() + 12 * 3600 * 1000), // Starting in 12h
        endDate: new Date(Date.now() + 36 * 3600 * 1000),
        status: 'SCHEDULED',
        images: [
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
        ],
        aiInsight: {
          recommendedMinPrice: 45000,
          recommendedMaxPrice: 58000,
          expectedDemand: 'Moderate',
          marketTrend: '→ Stable Market Rate',
          reasoning: 'Good soil structure and moisture balance in Meppadi support steady bidding values.',
        },
      },
    ];

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await Auction.deleteMany({ seller: req.user._id });

    const createdAuctions = [];
    for (const item of sampleAuctions) {
      let plantation = await Plantation.findOne({ owner: req.user._id });
      if (!plantation) {
        plantation = await Plantation.create({
          owner: req.user._id,
          name: item.title.split('(')[0].trim(),
          district: item.district,
          location: item.location,
          areaAcres: item.areaAcres,
          cardamomVariety: item.plantationType,
        });
      }

      const auc = await Auction.create({
        ...item,
        seller: req.user._id,
        plantation: plantation._id,
      });

      // Seed initial bids for demonstration
      if (auc.currentBid > auc.startingPrice) {
        await Bid.create({
          auction: auc._id,
          bidder: req.user._id,
          bidderMasked: auc.highestBidderMasked || 'Buyer #A82',
          amount: auc.currentBid,
          isHighest: true,
          placedAt: new Date(),
        });
      }

      createdAuctions.push(auc);
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${createdAuctions.length} live auction items successfully!`,
      auctions: createdAuctions,
    });
  } catch (error) {
    console.error('Error seeding auctions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
