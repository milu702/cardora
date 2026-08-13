const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } });

const { chatWithAi, scanDocument, diagnosePlant, diagnosePlantImage } = require('../controllers/aiController');

// @route   POST /api/ai/chat
router.post('/chat', chatWithAi);

// @route   POST /api/ai/scan-document
router.post('/scan-document', upload.single('document'), scanDocument);

// @route   POST /api/ai/diagnose-plant
router.post('/diagnose-plant', diagnosePlant);

// @route   POST /api/ai/diagnose-image
router.post('/diagnose-image', upload.single('image'), diagnosePlantImage);

module.exports = router;
