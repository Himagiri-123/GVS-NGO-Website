const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');

// Fetch all success stories (for the home page)
router.get('/', async (req, res) => {
  try {
    const stories = await SuccessStory.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new success story (Admin only)
router.post('/', async (req, res) => {
  try {
    const newStory = new SuccessStory(req.body);
    const savedStory = await newStory.save();
    res.status(201).json(savedStory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a success story (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    await SuccessStory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Success story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;