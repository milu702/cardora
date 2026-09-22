const express = require('express');
const router = express.Router();
const {
  scheduleVisit,
  getOwnerVisits,
  getVisitorVisits,
  updateVisitStatus,
} = require('../controllers/plantationVisitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', scheduleVisit);
router.get('/owner', getOwnerVisits);
router.get('/visitor', getVisitorVisits);
router.put('/:id/status', updateVisitStatus);

module.exports = router;
