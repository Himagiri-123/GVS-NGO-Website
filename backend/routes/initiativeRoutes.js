const express = require('express');
const router = express.Router();
const { getInitiativeBySlug, createOrUpdateInitiative } = require('../controllers/initiativeController');
const { protect } = require('../middlewares/authMiddleware');

// Public route (anyone can view - sends data to the frontend)
router.get('/:slug', getInitiativeBySlug);

// Removed the 'admin' only lock here — 'protect' is enough now, so computer teachers can also save data.
router.post('/', protect, createOrUpdateInitiative);

module.exports = router;