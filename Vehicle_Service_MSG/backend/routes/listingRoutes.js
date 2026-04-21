const express = require('express');
const router = express.Router();
const { getListings, createListing, updateListing, deleteListing } = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getListings).post(protect, createListing);
router.route('/:id').put(protect, updateListing).delete(protect, deleteListing);

module.exports = router;
