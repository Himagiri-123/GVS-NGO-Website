const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  village: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' } // for admin to approve
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
