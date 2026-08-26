const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['Study Center', 'Computer Center', 'Water Plant', 'Total NGO'] 
  },
  date: { 
    type: String, 
    required: true 
  },
  details: { 
    type: String, 
    required: true 
  },
  income: { // credit
    type: Number, 
    default: 0 
  },
  expense: { // expense
    type: Number, 
    default: 0 
  },
  balance: { // balance
    type: Number, 
    default: 0 
  },
  billUrl: { // bill photo link
    type: String, 
    default: '' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);