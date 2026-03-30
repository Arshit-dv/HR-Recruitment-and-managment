const express = require('express');
const router = express.Router();
const { 
  getAllContracts, getContractById, createContract, updateContract, deleteContract,
  getAllDepartments, createDepartment, updateDepartment, deleteDepartment,
  getAllDesignations, createDesignation, updateDesignation, deleteDesignation 
} = require('../controllers/departmentController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/contracts',     protect, getAllContracts);
router.get('/contracts/:id', protect, getContractById);
router.post('/contracts',    protect, requireRole('hr'), createContract);
router.patch('/contracts/:id', protect, requireRole('hr'), updateContract);
router.delete('/contracts/:id', protect, requireRole('hr'), deleteContract);

router.get('/departments',   protect, getAllDepartments);
router.post('/departments',  protect, requireRole('hr'), createDepartment);
router.patch('/departments/:id', protect, requireRole('hr'), updateDepartment);
router.delete('/departments/:id', protect, requireRole('hr'), deleteDepartment);

router.get('/designations',  protect, getAllDesignations);
router.post('/designations', protect, requireRole('hr'), createDesignation);
router.patch('/designations/:id', protect, requireRole('hr'), updateDesignation);
router.delete('/designations/:id', protect, requireRole('hr'), deleteDesignation);

module.exports = router;

