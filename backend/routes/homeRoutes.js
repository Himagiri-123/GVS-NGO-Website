const express = require('express');
const router = express.Router();
const { getHomeData, updateHomeData } = require('../controllers/homeController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getHomeData);
router.put('/', protect, admin, updateHomeData);

module.exports = router;