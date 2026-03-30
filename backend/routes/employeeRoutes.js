const express = require('express');
const router = express.Router();
const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/',    protect, requireRole('hr'), createEmployee);
router.get('/',     protect, requireRole('hr'), getAllEmployees);
router.get('/:id',  protect, getEmployeeById);
router.patch('/:id',protect, requireRole('hr'), updateEmployee);
router.delete('/:id', protect, requireRole('hr'), deleteEmployee);

module.exports = router;

