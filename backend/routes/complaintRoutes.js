const express = require('express');
const router = express.Router();
const { submitComplaint, getAllComplaints, getComplaintsByEmployee, updateComplaintStatus, deleteComplaint } = require('../controllers/complaintController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/',                       protect, submitComplaint);
router.get('/',                        protect, requireRole('hr'), getAllComplaints);
router.get('/employee/:employeeId',    protect, getComplaintsByEmployee);
router.patch('/:id/status',            protect, requireRole('hr'), updateComplaintStatus);
router.delete('/:id',                  protect, requireRole('hr'), deleteComplaint);

module.exports = router;

