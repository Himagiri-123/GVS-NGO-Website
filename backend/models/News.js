const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  text: { type: String, required: true },
  // Added a link field here
  link: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);