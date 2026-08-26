const ChikkiStock = require('../models/ChikkiStock');

const getChikkiStocks = async (req, res) => {
  try {
    const stocks = await ChikkiStock.find().sort({ date: 1 }); // ordered by date
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};

const addChikkiStock = async (req, res) => {
  try {
    const newStock = await ChikkiStock.create(req.body);
    res.status(201).json(newStock);
  } catch (error) {
    res.status(400).json({ message: "Failed to add", error: error.message });
  }
};

const updateChikkiStock = async (req, res) => {
  try {
    const updatedStock = await ChikkiStock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStock);
  } catch (error) {
    res.status(400).json({ message: "Failed to update", error: error.message });
  }
};

const deleteChikkiStock = async (req, res) => {
  try {
    await ChikkiStock.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete", error: error.message });
  }
};

module.exports = { getChikkiStocks, addChikkiStock, updateChikkiStock, deleteChikkiStock };