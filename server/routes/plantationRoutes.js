const express = require('express');
const router = express.Router();
const {
  createPlantation,
  getPlantations,
  getPlantationById,
  updatePlantation,
  deletePlantation,
  addExpense,
  analyzePlantation,
} = require('../controllers/plantationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, upload.array('images', 5), createPlantation)
  .get(protect, getPlantations);

router.route('/:id')
  .get(protect, getPlantationById)
  .put(protect, updatePlantation)
  .delete(protect, deletePlantation);

router.route('/:id/expenses')
  .post(protect, addExpense);

router.route('/:id/analyze')
  .post(protect, analyzePlantation);

module.exports = router;
