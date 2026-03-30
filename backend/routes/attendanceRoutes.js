const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, getAttendanceReport } = require('../controllers/attendanceController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/',      protect, getAttendance);
router.post('/',     protect, requireRole('hr'), markAttendance);
router.get('/report', protect, getAttendanceReport);

module.exports = router;
