const router = require('express').Router();
const ctrl = require('../controllers/userController');

router.get('/:userId', ctrl.getProfile);
router.put('/:userId', ctrl.updateProfile);

module.exports = router;
