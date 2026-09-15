const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } });

const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  chatWithAi,
  scanDocument,
  diagnosePlant,
  diagnosePlantImage,
  getFertilizerRecommendation,
  getFertilizerHistory,
  predictCropYield,
  evaluateInvestmentRisk,
  createExpertConsultation,
  getExpertConsultations,
  answerExpertConsultation,
  getAiConversations,
  createAiConversation,
  getAiConversationMessages,
  renameAiConversation,
  deleteAiConversation,
  sendAiMessage,
  analyzeCropImageController,
  escalateToExpertController,
} = require('../controllers/aiController');

const {
  analyzeCropDiagnosis,
  getCropDiagnosisHistory,
  getCropDiagnosisById,
  compareCropImages,
  askCardoraAboutDiagnosis,
  getPlotHealthStatus,
} = require('../controllers/cropDiagnosisController');

// ===== REAL AI CROP DIAGNOSIS ROUTES =====
router.post('/crop-diagnosis/analyze', optionalAuth, upload.single('image'), analyzeCropDiagnosis);
router.get('/crop-diagnosis/history', optionalAuth, getCropDiagnosisHistory);
router.get('/crop-diagnosis/history/:id', optionalAuth, getCropDiagnosisById);
router.post('/crop-diagnosis/compare', optionalAuth, compareCropImages);
router.post('/crop-diagnosis/ask', optionalAuth, askCardoraAboutDiagnosis);
router.get('/crop-diagnosis/plot-health/:plantationId', optionalAuth, getPlotHealthStatus);

// ===== EXISTING AI ROUTES =====
router.post('/chat', chatWithAi);
router.post('/scan-document', upload.single('document'), scanDocument);
router.post('/diagnose-plant', diagnosePlant);
router.post('/diagnose-image', upload.single('image'), analyzeCropDiagnosis); // Updated to point to Real Gemini Vision analysis

router.post('/fertilizer-recommendation', protect, getFertilizerRecommendation);
router.get('/fertilizer-history/:plantationId', protect, getFertilizerHistory);
router.post('/predict-yield', predictCropYield);
router.post('/evaluate-investment-risk', evaluateInvestmentRisk);

router.post('/expert-consultation', protect, createExpertConsultation);
router.get('/expert-consultations', protect, getExpertConsultations);
router.put('/expert-consultation/:id/answer', protect, answerExpertConsultation);

router.get('/conversations', optionalAuth, getAiConversations);
router.post('/conversations', optionalAuth, createAiConversation);
router.get('/conversations/:id', optionalAuth, getAiConversationMessages);
router.put('/conversations/:id', optionalAuth, renameAiConversation);
router.delete('/conversations/:id', optionalAuth, deleteAiConversation);
router.post('/conversations/:id/messages', optionalAuth, sendAiMessage);
router.post('/analyze-image', optionalAuth, analyzeCropImageController);
router.post('/ask-expert', optionalAuth, escalateToExpertController);

module.exports = router;
