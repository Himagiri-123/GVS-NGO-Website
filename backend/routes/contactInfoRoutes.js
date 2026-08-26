const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');
const { protect } = require('../middlewares/authMiddleware');

const DEFAULT_CONTACT_INFO = {
  orgName: 'Grameena Vikas Sangham',
  addressLines: [
    'Vikasa Nilayam, Ghanasara village,',
    'Bhamini mandal, Parvathipuram Manyam Dist,',
    'Andhra Pradesh - 532455'
  ],
  leadership: [
    { name: 'Sri K. Rajendra', role: 'Founder' },
    { name: 'Sri Gudla SatyaRao', role: 'President' },
    { name: 'Dr. Majji Eswara Rao', role: 'Secretary' }
  ],
  keyContacts: ['Sri Konapala Neelakantam', 'Sri Yerukumajji Appalanayudu'],
  email: 'grameenavikassangamsrikakulam@gmail.com'
};

// Public: fetch contact info (for the Contact page)
router.get('/', async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      info = await ContactInfo.create(DEFAULT_CONTACT_INFO);
    }
    res.status(200).json(info);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: update contact info
router.put('/', protect, async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (info) {
      info = await ContactInfo.findOneAndUpdate({}, req.body, { new: true });
    } else {
      info = await ContactInfo.create(req.body);
    }
    res.status(200).json(info);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
