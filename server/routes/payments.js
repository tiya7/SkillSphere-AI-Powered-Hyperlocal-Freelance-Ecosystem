const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  releasePayment,
  getMyPayments,
  refundPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/initiate', authorize('client'), initiatePayment);
router.post('/verify', authorize('client'), verifyPayment);
router.get('/my', getMyPayments);
router.put('/:id/release', authorize('client'), releasePayment);
router.put('/:id/refund', refundPayment);

module.exports = router;
