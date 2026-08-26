const express = require('express');
const router = express.Router();
const BankDetail = require('../models/BankDetail');

// Fetch bank details (for the donate page)
router.get('/', async (req, res) => {
  try {
    const details = await BankDetail.findOne(); 
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update or create bank details (Admin only)
router.post('/', async (req, res) => {
  try {
    let details = await BankDetail.findOne();
    if (details) {
      // If existing details are there, update them
      details = await BankDetail.findOneAndUpdate({}, req.body, { new: true });
    } else {
      // If no details exist, create new
      details = new BankDetail(req.body);
      await details.save();
    }
    res.status(200).json(details);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;