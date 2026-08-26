const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'computer_teacher', 'vvk_instructor', 'coordinator'], 
    default: 'admin' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date },
  passwordChangedAt: { type: Date },
  // Current session token field (single-device login lock, no longer enforced)
  currentSessionToken: { type: String, default: null } 
}, { timestamps: true }); 

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  this.passwordChangedAt = Date.now() - 1000; 
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);