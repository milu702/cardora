const Plantation = require('../models/Plantation');
const User = require('../models/User');

// Helper to calculate Health Score based on soil moisture, pH, and NPK
const calculateHealthScore = (moisture = 72, ph = 6.2, district = '') => {
  let score = 90;
  if (moisture < 50 || moisture > 85) score -= 15;
  if (ph < 5.5 || ph > 7.0) score -= 15;
  const isOptimalDistrict = (district || '').toLowerCase().includes('idukki') || (district || '').toLowerCase().includes('wayanad');
  if (!isOptimalDistrict && district) score -= 25;
  return Math.max(30, Math.min(100, Math.round(score)));
};

// @desc    Add a new plantation
// @route   POST /api/plantations
// @access  Private
exports.createPlantation = async (req, res) => {
  try {
    const {
      name, ownerName, district, taluk, village, address, pincode,
      latitude, longitude, area, altitude, image, images,
      variety, plantingYear, plantsCount, plantAge,
      soilType, ph, nitrogen, phosphorus, potassium, organicCarbon, moisture,
      irrigation, sensorId, gpsEnabled
    } = req.body;

    if (!name || !area) {
      return res.status(400).json({ success: false, message: 'Plantation name and area are required' });
    }

    const userId = req.user ? (req.user._id || req.user.id || '650000000000000000000001') : '650000000000000000000001';
    const calculatedMoisture = Number(moisture) || 72;
    const calculatedPh = Number(ph) || 6.2;
    const selectedDistrict = district || 'Idukki, Kerala';
    const computedHealth = calculateHealthScore(calculatedMoisture, calculatedPh, selectedDistrict);

    const imageUrl = image || (req.files && req.files.length > 0 ? (req.files[0].path || req.files[0].secure_url) : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80');

    const newPlantation = await Plantation.create({
      user: userId,
      name,
      ownerName: ownerName || req.user?.fullName || req.user?.name || 'Cardora Planter',
      district: selectedDistrict,
      location: selectedDistrict,
      taluk: taluk || 'Udumbanchola',
      village: village || 'Vandanmedu',
      address: address || `${village || 'Vandanmedu'}, ${selectedDistrict}`,
      pincode: pincode || '685551',
      latitude: Number(latitude) || 9.85,
      longitude: Number(longitude) || 76.97,
      area: Number(area),
      altitude: Number(altitude) || 950,
      image: imageUrl,
      images: images || [imageUrl],

      // Crop Details
      variety: variety || 'Njallani',
      plantingYear: Number(plantingYear) || 2021,
      plantsCount: Number(plantsCount) || Math.round(Number(area) * 350),
      plantAge: plantAge || '3.5 Years',

      // Soil Details
      soil: {
        soilType: soilType || 'Loamy Forest Soil',
        ph: calculatedPh,
        npk: {
          n: Number(nitrogen) || 140,
          p: Number(phosphorus) || 45,
          k: Number(potassium) || 180,
        },
        organicCarbon: Number(organicCarbon) || 1.8,
        moisture: calculatedMoisture,
      },
      soilPh: calculatedPh,
      moisture: calculatedMoisture,
      npk: { n: Number(nitrogen) || 140, p: Number(phosphorus) || 45, k: Number(potassium) || 180 },

      // Irrigation & Sensor
      irrigation: irrigation || 'Drip',
      sensor: {
        sensorId: sensorId || `SENSOR-${(selectedDistrict || 'IDK').substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
        currentMoisture: calculatedMoisture,
        lastSensorUpdate: new Date(),
        gpsEnabled: gpsEnabled !== undefined ? Boolean(gpsEnabled) : true,
      },

      healthScore: computedHealth,
      weatherStatus: 'Optimal Micro-Climate',
      aiStatus: 'Smart Drip Irrigation Recommended',

      workers: {
        presentToday: Math.min(12, Math.max(3, Math.round(Number(area) * 1.5))),
        totalWorkers: Math.min(15, Math.max(4, Math.round(Number(area) * 2))),
        workingHours: 8,
        taskAssigned: 'Routine Canopy Pruning & Soil Moisture Check',
        tasksCompleted: 3,
        tasksPending: 1,
        workProgress: 75,
        supervisorRemarks: 'Estate in prime condition. Moisture levels healthy.',
      },

      expenses: [
        {
          title: 'Bio-Organic Fertilizer Application',
          amount: 4500,
          category: 'Fertilizer',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          notes: 'Neem cake and compost applied across all plots.'
        }
      ],

      history: [
        {
          title: 'Plantation Registered on Cardora',
          category: 'Setup',
          timestamp: new Date(),
          details: `Registered ${name} (${area} Acres, ${variety} variety) in ${selectedDistrict}.`
        }
      ]
    });

    // Update plantation count on User model
    try {
      if (req.user?._id || req.user?.id) {
        await User.findByIdAndUpdate(req.user._id || req.user.id, { $inc: { plantationCount: 1 } });
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: 'Plantation created successfully in CARDORA Ecosystem',
      plantation: newPlantation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user plantations
// @desc    Get user plantations
// @route   GET /api/plantations
// @access  Private
exports.getPlantations = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const ownerNameVal = req.user?.fullName || req.user?.name || '';
    
    let query = {};
    if (userId) {
      query = {
        $or: [
          { user: userId },
          { user: userId.toString() },
          ...(ownerNameVal ? [{ ownerName: new RegExp(`^${ownerNameVal}$`, 'i') }] : [])
        ]
      };
    }
    const plantations = await Plantation.find(query).sort({ createdAt: -1 });

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

    // Re-calculate health score if soil metrics updated
    if (req.body.soil || req.body.moisture || req.body.ph || req.body.district) {
      const m = req.body.soil?.moisture || req.body.moisture || plantation.soil?.moisture || plantation.moisture;
      const p = req.body.soil?.ph || req.body.ph || plantation.soil?.ph || plantation.soilPh;
      const d = req.body.district || plantation.district;
      req.body.healthScore = calculateHealthScore(m, p, d);
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

    res.status(200).json({ success: true, message: 'Plantation deleted from CARDORA system' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Expense to Plantation
// @route   POST /api/plantations/:id/expenses
// @access  Private
exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, notes } = req.body;
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    plantation.expenses.push({
      title: title || 'Plantation Expense',
      amount: Number(amount) || 0,
      category: category || 'Miscellaneous',
      date: new Date(),
      notes: notes || ''
    });

    plantation.history.unshift({
      title: `Added Expense: ${title} (₹${amount})`,
      category: 'Expense',
      timestamp: new Date(),
      details: `Category: ${category}. Notes: ${notes || 'N/A'}`
    });

    await plantation.save();

    res.status(200).json({
      success: true,
      message: 'Expense added to plantation',
      plantation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
