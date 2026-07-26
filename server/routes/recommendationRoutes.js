const express = require('express');
const router = express.Router();
const {
  createRecommendation,
  getRecommendations,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createRecommendation)
  .get(protect, getRecommendations);

module.exports = router;
