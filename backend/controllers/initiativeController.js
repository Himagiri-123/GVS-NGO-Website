const Initiative = require('../models/Initiative');

// @desc    Send data from the database to the frontend (Public)
// @route   GET /api/initiatives/:slug
const getInitiativeBySlug = async (req, res) => {
  try {
    const initiative = await Initiative.findOne({ slug: req.params.slug });
    
    if (initiative) {
      res.json(initiative);
    } else {
      res.status(404).json({ message: "No data found for this page!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create or update data (Admin only)
// @route   POST /api/initiatives
const createOrUpdateInitiative = async (req, res) => {
  // Also receiving courseTableRows here
  const { slug, title, icon, description, layout, sections, leftSide, rightSide, tableHeaders, tableRows, photos, courseTableRows } = req.body;

  try {
    let initiative = await Initiative.findOne({ slug });

    if (initiative) {
      // If data already exists, update it
      initiative.title = title || initiative.title;
      initiative.icon = icon || initiative.icon;
      initiative.description = description || initiative.description;
      initiative.layout = layout || initiative.layout;
      initiative.sections = sections || initiative.sections;
      initiative.leftSide = leftSide || initiative.leftSide;
      initiative.rightSide = rightSide || initiative.rightSide;
      initiative.tableHeaders = tableHeaders || initiative.tableHeaders;
      initiative.tableRows = tableRows || initiative.tableRows;
      initiative.photos = photos || initiative.photos;
      
      // Attaching the incoming course details so they get saved to the database
      initiative.courseTableRows = courseTableRows || initiative.courseTableRows;

      const updatedInitiative = await initiative.save();
      res.json(updatedInitiative);
    } else {
      // If it doesn't exist, create it
      const newInitiative = await Initiative.create(req.body);
      res.status(201).json(newInitiative);
    }
  } catch (error) {
    res.status(500).json({ message: "Data update failed", error: error.message });
  }
};

module.exports = { getInitiativeBySlug, createOrUpdateInitiative };