const HomeData = require('../models/HomeData');

// @desc    Fetch home page data (Public & Admin)
// @route   GET /api/home
const getHomeData = async (req, res) => {
  try {
    let data = await HomeData.findOne();
    // If no data exists, create a default document
    if (!data) {
      data = await HomeData.create({
        carouselPhotos: [],
        stats: { establishedYear: "2008", villagesCount: "21+", impactCount: "770+", regdNo: "CIT 2/80G/28/2009-10", regdDate: "08/06/2010" }
      });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update home page data (Admin only)
// @route   PUT /api/home
const updateHomeData = async (req, res) => {
  try {
    let data = await HomeData.findOne();
    if (!data) {
      data = new HomeData(req.body);
      await data.save();
    } else {
      data.carouselPhotos = req.body.carouselPhotos || data.carouselPhotos;
      data.stats = req.body.stats || data.stats;
      await data.save();
    }
    res.json({ message: "Homepage data updated successfully!", data });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

module.exports = { getHomeData, updateHomeData };