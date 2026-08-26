const MainOfficeStock = require('../models/MainOfficeStock');

const getMainOfficeStocks = async (req, res) => {
  try {
    const stocks = await MainOfficeStock.find().sort({ date: 1 }); 
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching main office stock", error: error.message });
  }
};

const addMainOfficeStock = async (req, res) => {
  try {
    const newStock = await MainOfficeStock.create(req.body);
    res.status(201).json(newStock);
  } catch (error) {
    res.status(400).json({ message: "Failed to add", error: error.message });
  }
};

const updateMainOfficeStock = async (req, res) => {
  try {
    const updatedStock = await MainOfficeStock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStock);
  } catch (error) {
    res.status(400).json({ message: "Failed to update", error: error.message });
  }
};

const deleteMainOfficeStock = async (req, res) => {
  try {
    await MainOfficeStock.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete", error: error.message });
  }
};

module.exports = { getMainOfficeStocks, addMainOfficeStock, updateMainOfficeStock, deleteMainOfficeStock };