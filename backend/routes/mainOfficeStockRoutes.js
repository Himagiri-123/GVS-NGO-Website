const express = require('express');
const router = express.Router();
const { getMainOfficeStocks, addMainOfficeStock, updateMainOfficeStock, deleteMainOfficeStock } = require('../controllers/mainOfficeStockController');

router.route('/').get(getMainOfficeStocks).post(addMainOfficeStock);
router.route('/:id').put(updateMainOfficeStock).delete(deleteMainOfficeStock);

module.exports = router;