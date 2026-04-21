const router = require('express').Router();
const ctrl = require('../controllers/transactionController');

// Get user transactions
router.get('/:userId', ctrl.getTransactions);

// Create new transaction
router.post('/', ctrl.createTransaction);

// Optimize transaction (AI service)
router.post('/optimize', ctrl.optimizeTransaction);

// Complete transaction flow (optimize + create)
router.post('/process', ctrl.processTransaction);

// Health check
router.get('/health/check', ctrl.healthCheck);

module.exports = router;
