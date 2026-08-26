const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  education: { type: String, required: true },
  village: { type: String, required: true },
  mandal: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  status: { type: String, default: 'Pending' }, 
  // Added to store the batch number
  batchNumber: { type: String, default: '' } 
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);