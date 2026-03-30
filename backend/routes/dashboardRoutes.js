const express = require('express');
const router = express.Router();
const { getHRDashboard, getEmployeeDashboard } = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/hr', protect, requireRole('hr'), getHRDashboard);
router.get('/employee/:id', protect, getEmployeeDashboard);

module.exports = router;
