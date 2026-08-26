const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  className: { type: String, required: true },
  gender: { type: String, required: true },
  academicYear: { type: String, required: true },
  phone: { type: String, required: true },
  village: { type: String, required: true },
  addedBy: { type: String },
  category: { type: String, default: 'VVK' },
  batchNumber: { type: String, default: '-' },

  // Fields added for Computer course students
  certificateSerialNo: { type: String, default: '-' }, 
  fatherName: { type: String, default: '-' },
  courseName: { type: String, default: 'MS-OFFICE & INTERNET' },
  joinDate: { type: String, default: '-' },
  endDate: { type: String, default: '-' },
  grade: { type: String, default: '-' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);