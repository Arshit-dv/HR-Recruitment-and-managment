const express = require('express');
const router = express.Router();
const { getAllCandidates, getCandidateById, createCandidate, updateCandidate, deleteCandidate } = require('../controllers/candidateController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/',    protect, requireRole('hr'), getAllCandidates);
router.post('/',   protect, requireRole('hr'), createCandidate);
router.get('/:id', protect, requireRole('hr'), getCandidateById);
router.patch('/:id', protect, requireRole('hr'), updateCandidate);
router.delete('/:id', protect, requireRole('hr'), deleteCandidate);

module.exports = router;

