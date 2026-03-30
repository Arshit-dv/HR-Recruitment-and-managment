const express = require('express');
const router = express.Router();
const { getAllTraining, startTraining, completeTraining, addTrainerFeedback, deleteTraining } = require('../controllers/trainingController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/',                        protect, requireRole('hr'), startTraining);
router.get('/',                         protect, requireRole('hr'), getAllTraining);
router.patch('/:candidateId/complete',  protect, requireRole('hr'), completeTraining);
router.post('/:candidateId/feedback',   protect, requireRole('hr'), addTrainerFeedback);
router.delete('/:candidateId',          protect, requireRole('hr'), deleteTraining);

module.exports = router;
