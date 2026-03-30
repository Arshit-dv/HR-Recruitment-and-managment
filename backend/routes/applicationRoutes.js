const express = require('express');
const router = express.Router();
const { submitApplication, getAllApplications, getApplicationById, screenApplication, updateApplication, deleteApplication } = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/',          submitApplication);                                    // Public
router.get('/',           protect, requireRole('hr'), getAllApplications);
router.get('/:id',        protect, requireRole('hr'), getApplicationById);
router.patch('/:id',      protect, requireRole('hr'), updateApplication);
router.delete('/:id',     protect, requireRole('hr'), deleteApplication);
router.post('/:id/screen',protect, requireRole('hr'), screenApplication);       // Create candidate

module.exports = router;

