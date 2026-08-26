const express = require('express');
const router = express.Router();
const { submitApplication, getApplications, approveBatch } = require('../controllers/applicationController');
const { protect } = require('../middlewares/authMiddleware');
const formSubmitLimiter = require('../middlewares/rateLimiter');

router.post('/', formSubmitLimiter(), submitApplication);
router.get('/', protect, getApplications);

// Route to approve/allocate a batch
router.put('/:id/approve', protect, approveBatch);

module.exports = router;