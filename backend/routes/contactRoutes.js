const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/contactController');
const formSubmitLimiter = require('../middlewares/rateLimiter');

router.post('/', formSubmitLimiter(), sendMessage);

module.exports = router;