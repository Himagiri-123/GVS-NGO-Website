const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // e.g. Founder, President, Secretary
  bio: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  order: { type: Number, default: 0 }, // controls display order (lower = first)
  visible: { type: Boolean, default: true } // admin can hide without deleting
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
