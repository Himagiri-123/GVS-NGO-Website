const express = require('express');
const router = express.Router();
const { getAccounts, addAccount, updateAccount, deleteAccount } = require('../controllers/accountController');

router.route('/').get(getAccounts).post(addAccount);
// Added .put(updateAccount) here
router.route('/:id').put(updateAccount).delete(deleteAccount);

module.exports = router;