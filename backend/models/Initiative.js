const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  village: { type: String }
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  table: {
    headers: [{ type: String }], 
    rows: [{ type: Object }]     
  },
  photos: [photoSchema]
});

const initiativeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, 
  title: { type: String, required: true },
  
  // Stores which category this belongs to
  category: { type: String, default: 'others' }, 

  icon: { type: String },
  description: { type: String },
  layout: { type: String, enum: ['generic', 'split', 'paginated'], default: 'generic' }, 
  
  sections: [sectionSchema],
  leftSide: { type: Object },
  rightSide: { type: Object },

  tableHeaders: [{ type: String }],
  tableRows: [{ type: Object }],
  photos: [photoSchema],
  
  courseTableRows: [{ type: Object }]
}, { timestamps: true });

module.exports = mongoose.model('Initiative', initiativeSchema);