const Plantation = require('../models/Plantation');
const User = require('../models/User');

// @desc    Add a new plantation
// @route   POST /api/plantations
// @access  Private
exports.createPlantation = async (req, res) => {
  try {
    const { name, location, area, plantsCount, variety, plantAge, soilPh, npk, moisture, history } = req.body;

    if (!name || !area) {
      return res.status(400).json({ success: false, message: 'Plantation name and area are required' });
    }

    const plantation = await Plantation.create({
      user: req.user._id || req.user.id,
      name,
      location: location || 'Idukki, Kerala',
      area: Number(area),
      plantsCount: Number(plantsCount) || 1500,
      variety: variety || 'Malabar',
      plantAge: plantAge || '3 Years',
      soilPh: Number(soilPh) || 6.2,
      npk: npk || { n: 140, p: 45, k: 180 },
      moisture: Number(moisture) || 72,
      healthScore: Math.min(100, Math.max(50, Math.round(((Number(moisture) || 72) / 75) * 50 + ((Number(soilPh) || 6.2) / 6.5) * 50))),
      history: history || 'Plantation registered today',
      images: req.files ? req.files.map((file) => file.path || file.secure_url) : [],
    });

    // Update plantation count on User model
    try {
      await User.findByIdAndUpdate(req.user._id || req.user.id, { $inc: { plantationCount: 1 } });
    } catch (e) {
      // Ignore if mock user
    }

    res.status(201).json({
      success: true,
      message: 'Plantation created successfully in MongoDB Atlas',
      plantation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user plantations
// @route   GET /api/plantations
// @access  Private
exports.getPlantations = async (req, res) => {
  try {
    const plantations = await Plantation.find({ user: req.user._id || req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: plantations.length, plantations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single plantation by ID
// @route   GET /api/plantations/:id
// @access  Private
exports.getPlantationById = async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }
    res.status(200).json({ success: true, plantation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update plantation
// @route   PUT /api/plantations/:id
// @access  Private
exports.updatePlantation = async (req, res) => {
  try {
    let plantation = await Plantation.findById(req.params.id);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    plantation = await Plantation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Plantation updated successfully',
      plantation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete plantation
// @route   DELETE /api/plantations/:id
// @access  Private
exports.deletePlantation = async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    await plantation.deleteOne();

    try {
      await User.findByIdAndUpdate(req.user._id || req.user.id, { $inc: { plantationCount: -1 } });
    } catch (e) {}

    res.status(200).json({ success: true, message: 'Plantation deleted from MongoDB Atlas' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
