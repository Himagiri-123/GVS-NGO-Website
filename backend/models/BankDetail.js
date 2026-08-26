const mongoose = require('mongoose');

const bankDetailSchema = new mongoose.Schema({
  bankName: { type: String },
  accName: { type: String },
  accNo: { type: String },
  ifsc: { type: String },
  upiId: { type: String },
  qrCodeUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BankDetail', bankDetailSchema);