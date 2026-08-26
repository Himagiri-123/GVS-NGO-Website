const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  staffName: { type: String, required: true },
  village: { type: String, required: true },
  date: { type: String, required: true }, // e.g. 2026-03-01
  studentsPresent: { type: Number, required: true },
  chikkisDistributed: { type: Number, required: true },
  notes: { type: String } // for noting any issues
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);