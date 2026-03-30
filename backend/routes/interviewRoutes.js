const express = require('express');
const router = express.Router();
const { scheduleInterview, getAllInterviews, updateInterviewStatus, deleteInterview } = require('../controllers/interviewController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/',      protect, requireRole('hr'), scheduleInterview);
router.get('/',       protect, requireRole('hr'), getAllInterviews);
router.patch('/:id',  protect, requireRole('hr'), updateInterviewStatus);
router.delete('/:id', protect, requireRole('hr'), deleteInterview);

module.exports = router;
