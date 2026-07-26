const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  contactSeller,
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/listings')
  .post(protect, upload.array('images', 5), createListing)
  .get(getListings);

router.route('/listings/:id')
  .get(getListingById)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

router.post('/listings/:id/contact', contactSeller);

module.exports = router;
