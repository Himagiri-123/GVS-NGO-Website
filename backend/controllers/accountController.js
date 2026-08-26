const Account = require('../models/Account');

// @desc    Get all accounts
// @route   GET /api/accounts
const getAccounts = async (req, res) => {
  try {
    // Fetch existing records first, to auto-calculate the balance
    const accounts = await Account.find().sort({ date: 1 }); 
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Data not found", error: error.message });
  }
};

// @desc    Add a new account record
// @route   POST /api/accounts
const addAccount = async (req, res) => {
  try {
    const newAccount = await Account.create(req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(400).json({ message: "Record could not be saved", error: error.message });
  }
};

// @desc    Edit/update an account record
// @route   PUT /api/accounts/:id
const updateAccount = async (req, res) => {
  try {
    const updatedAccount = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc    Delete an account record
// @route   DELETE /api/accounts/:id
const deleteAccount = async (req, res) => {
  try {
    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: "Record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

module.exports = { getAccounts, addAccount, updateAccount, deleteAccount };