const Report = require('../models/Report');

// Existing: submitReport, getReports (kept as is)
const submitReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json({ message: "Report saved successfully!", report });
  } catch (error) { res.status(400).json({ message: "An error occurred", error: error.message }); }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }); 
    res.json(reports);
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

// Function to edit an existing report
const updateReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedReport);
  } catch (error) { res.status(500).json({ message: "Update failed", error: error.message }); }
};

// Function to delete a report
const deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (error) { res.status(500).json({ message: "Delete failed", error: error.message }); }
};

// Update this line below:
module.exports = { submitReport, getReports, updateReport, deleteReport };