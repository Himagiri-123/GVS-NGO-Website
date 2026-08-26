const express = require('express');
const router = express.Router();
const { submitReport, getReports, updateReport, deleteReport } = require('../controllers/reportController');

router.post('/', submitReport); 
router.get('/', getReports);    
router.put('/:id', updateReport); 
router.delete('/:id', deleteReport); 

module.exports = router;