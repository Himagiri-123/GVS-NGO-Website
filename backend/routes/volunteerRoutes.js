const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const formSubmitLimiter = require('../middlewares/rateLimiter');

// New volunteer application (public website form)
router.post('/', formSubmitLimiter(), async (req, res) => {
  try {
    const newVolunteer = new Volunteer(req.body);
    const savedVolunteer = await newVolunteer.save();
    res.status(201).json(savedVolunteer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all applications (for admin panel)
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an application (admin only)
router.delete('/:id', async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;