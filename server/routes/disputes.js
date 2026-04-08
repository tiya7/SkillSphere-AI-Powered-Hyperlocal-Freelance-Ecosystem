const express = require('express');
const router = express.Router();
const { openDispute, getMyDisputes, getAllDisputes, resolveDispute } = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', openDispute);
router.get('/my', getMyDisputes);
router.get('/', authorize('admin'), getAllDisputes);
router.put('/:id/resolve', authorize('admin'), resolveDispute);
module.exports = router;
