const express = require('express');
const router = express.Router();
const { addStudent, getStudents, deleteStudent, updateStudent, verifyCertificate, verifyBySerial } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes (no 'protect' middleware) - must stay above the protected routes
router.post('/verify', verifyCertificate);
router.get('/certificate/:serialNo', verifyBySerial);

// Protected routes (admin/staff only)
router.post('/', protect, addStudent);
router.get('/', protect, getStudents);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;