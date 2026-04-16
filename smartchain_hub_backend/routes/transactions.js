const router = require('express').Router();
const ctrl = require('../controllers/transactionController');

router.get('/:userId', ctrl.getTransactions);
router.post('/', ctrl.createTransaction);
router.post('/optimize', ctrl.optimizeTransaction);

module.exports = router;
