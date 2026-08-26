const mongoose = require('mongoose');

const homeDataSchema = new mongoose.Schema({
  // For scrolling photos
  carouselPhotos: [{ url: String, caption: String }],
  
  // For stats numbers
  stats: {
    establishedYear: { type: String, default: "2008" },
    villagesCount: { type: String, default: "21+" },
    impactCount: { type: String, default: "770+" },
    regdNo: { type: String, default: "CIT 2/80G/28/2009-10" },
    regdDate: { type: String, default: "08/06/2010" }
  }
}, { timestamps: true });

module.exports = mongoose.model('HomeData', homeDataSchema);