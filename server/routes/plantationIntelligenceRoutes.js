const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLatestIntelligence,
  analyzePlantationIntelligence,
  getAnalysisHistory,
  getAnalysisReportById,
  generateAnalysisPdf,
  submitAnalysisToAdmin,
} = require('../controllers/plantationIntelligenceController');

// All endpoints require user authentication & plantation ownership verification
router.get('/:plantationId/current', protect, getLatestIntelligence);
router.post('/:plantationId/analyze', protect, analyzePlantationIntelligence);
router.get('/:plantationId/history', protect, getAnalysisHistory);
router.get('/:plantationId/report/:analysisId', protect, getAnalysisReportById);
router.get('/:plantationId/pdf/:analysisId', protect, generateAnalysisPdf);
router.post('/:plantationId/submit/:analysisId', protect, submitAnalysisToAdmin);

module.exports = router;
