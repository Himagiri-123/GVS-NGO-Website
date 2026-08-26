const mongoose = require('mongoose');

const chikkiStockSchema = new mongoose.Schema({
  date: { type: String, required: true },
  village: { type: String, required: true },
  mandal: { type: String, required: true },
  supply: { type: Number, default: 0 }, // received from the office
  used: { type: Number, default: 0 },   // distributed to children
  remarks: { type: String, default: '' },
  addedBy: { type: String, default: 'Admin' } // whether added by admin or staff
}, { timestamps: true });

module.exports = mongoose.model('ChikkiStock', chikkiStockSchema);