const express = require('express');
const router = express.Router();
const { getChikkiStocks, addChikkiStock, updateChikkiStock, deleteChikkiStock } = require('../controllers/chikkiStockController');

router.route('/').get(getChikkiStocks).post(addChikkiStock);
router.route('/:id').put(updateChikkiStock).delete(deleteChikkiStock);

module.exports = router;