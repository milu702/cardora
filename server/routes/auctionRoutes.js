const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAuctions,
  getAuctionById,
  createAuction,
  placeBid,
  getAiPriceInsight,
  getMyAuctions,
  adminApproveRejectAuction,
  seedSampleAuctions,
} = require('../controllers/auctionController');

router.route('/')
  .get(getAuctions)
  .post(protect, createAuction);

router.get('/my-auctions', protect, getMyAuctions);
router.post('/ai-price-insight', protect, getAiPriceInsight);
router.post('/seed', protect, seedSampleAuctions);

router.route('/:id')
  .get(getAuctionById);

router.post('/:id/bid', protect, placeBid);
router.put('/:id/approve', protect, admin, adminApproveRejectAuction);

module.exports = router;
