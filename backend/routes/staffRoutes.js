const express = require('express');
const router = express.Router();
// Importing logoutStaff
const { getStaff, addStaff, deleteStaff, updateStaff, staffLogin, logoutStaff, verifyExperienceCertificate, getMyCertificateData } = require('../controllers/staffController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getStaff);
router.post('/login', staffLogin);
router.post('/logout', logoutStaff); // for the logout lock
router.post('/verify-experience', verifyExperienceCertificate); // public verification
router.get('/my-certificate', protect, getMyCertificateData); // staff's own certificate data (login required)

router.post('/', protect, admin, addStaff);
router.put('/:id', protect, admin, updateStaff);
router.delete('/:id', protect, admin, deleteStaff);

module.exports = router;