const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  village: { type: String, required: true },
  achievement: { type: String, required: true },
  quote: { type: String, required: true },
  image: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model('SuccessStory', successStorySchema);