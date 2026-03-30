const express = require('express');
const router = express.Router();
const { generateOffer, getAllOffers, getOfferById, awardOffer, updateOfferStatus, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/',              protect, requireRole('hr'), generateOffer);
router.get('/',               protect, requireRole('hr'), getAllOffers);
router.get('/:id',            protect, getOfferById);
router.patch('/:id',          protect, requireRole('hr'), updateOffer);
router.delete('/:id',         protect, requireRole('hr'), deleteOffer);
router.post('/:id/award',     protect, requireRole('hr'), awardOffer);
router.patch('/:id/status',   protect, requireRole('hr'), updateOfferStatus);

module.exports = router;

