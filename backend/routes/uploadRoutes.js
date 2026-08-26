const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// Adding security so only admins can upload photos
const { protect, admin } = require('../middlewares/authMiddleware');

// @route   POST /api/upload
// @desc    Upload a single image to Cloudinary
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  // After upload, send the photo's online URL back to the frontend
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path, 
  });
});

module.exports = router;