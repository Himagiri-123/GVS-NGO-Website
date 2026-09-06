const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Coordinator', 'VVK Instructor', 'Govt Teacher', 'Caretaker', 'Computer Teacher'] 
  },
  role: { type: String, required: true }, 
  qualification: { type: String, required: true },
  experience: { type: String, required: false, default: '' }, // legacy manual field, kept for old records; new UI auto-calculates from joinDate instead
  mandal: { type: String },
  village: { type: String },
  phone: { type: String, required: true },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  photoUrl: { type: String, default: '' },
  showPhotoOnCert: { type: Boolean, default: true },
  password: { type: String, default: '123456' },
  // Current session token field (single-device login lock, no longer enforced)
  currentSessionToken: { type: String, default: null },

  // Fields for the staff Experience Certificate (Coordinator / VVK Instructor / Computer Teacher only)
  fatherName: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  joinDate: { type: String, default: '' }, // YYYY-MM-DD — used to auto-calculate years of service
  district: { type: String, default: 'Parvathipuram Manyam' },
  state: { type: String, default: 'Andhra Pradesh' },
  experienceCertId: { type: String, default: '' }, // e.g. GVS-EXP-000001, auto-generated
  staffId: { type: String, default: '' }, // e.g. GVS-STAFF-ID-001, auto-generated, separate from the certificate number
  gender: { type: String, default: 'Male', enum: ['Male', 'Female'] }, // used to show S/o or D/o correctly on the certificate
  showPhotoOnCert: { type: Boolean, default: true } // lets the staff/admin hide the photo on the certificate if they prefer
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);