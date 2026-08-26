const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  orgName: { type: String, default: 'Grameena Vikas Sangham' },
  addressLines: [{ type: String }], // e.g. ["Vikasa Nilayam, Ghanasara village,", "Bhamini mandal, ..."]
  leadership: [{ name: String, role: String }], // simple name+role list shown on Contact page
  keyContacts: [{ type: String }], // simple names list
  email: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
