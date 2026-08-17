const Recommendation = require('../models/Recommendation');

// @desc    Create/Store AI recommendation
// @route   POST /api/recommendations
// @access  Private
exports.createRecommendation = async (req, res) => {
  try {
    const { moisture, soilPh, n, p, k, plantationId } = req.body;

    const moistureVal = Number(moisture) || 70;
    const phVal = Number(soilPh) || 6.0;
    const calcHealth = Math.min(100, Math.max(50, Math.round((moistureVal / 75) * 50 + (phVal / 6.5) * 50)));

    const validPlantation = (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) ? plantationId : null;

    const recommendation = await Recommendation.create({
      user: req.user._id || req.user.id,
      plantation: validPlantation,
      moisture: moistureVal,
      soilPh: phVal,
      npk: { n: Number(n) || 140, p: Number(p) || 45, k: Number(k) || 180 },
      healthScore: calcHealth,
      yieldPrediction: `${Math.round(calcHealth * 4.5)} kg / acre`,
      diseaseRisk: moistureVal > 80 ? 'Moderate (High Humidity Rot Risk)' : 'Low Risk (Capsule Rot Risk 6%)',
      fertilizerAdvice: phVal < 5.8 ? 'Apply Agricultural Lime to raise soil pH to 6.2.' : 'Apply Neem Cake (500g/clump) & Organic Potash booster.',
      irrigationSchedule: moistureVal < 60 ? 'Increase drip irrigation duration.' : 'Maintain drip pulse every 48 hours for high altitude root zone.',
    });

    res.status(201).json({
      success: true,
      message: 'AI Agro Recommendation saved to MongoDB Atlas',
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user recommendations
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const recommendations = await Recommendation.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: recommendations.length, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
