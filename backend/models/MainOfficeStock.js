const mongoose = require('mongoose');

const mainOfficeStockSchema = new mongoose.Schema({
  date: { type: String, required: true },
  village: { type: String, required: true }, // Village, instead of Particulars
  mandal: { type: String, required: true },  // newly added Mandal field
  inward: { type: Number, default: 0 },
  outward: { type: Number, default: 0 },
  remarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('MainOfficeStock', mainOfficeStockSchema);