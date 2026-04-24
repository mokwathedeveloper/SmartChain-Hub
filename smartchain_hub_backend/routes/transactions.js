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

// Fine-tune TF model on real user transaction data from 0G Storage
router.post('/fine-tune', ctrl.fineTuneModel);

module.exports = router;
