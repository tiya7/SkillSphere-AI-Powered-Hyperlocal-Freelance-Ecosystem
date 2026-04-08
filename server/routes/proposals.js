const express = require('express');
const router = express.Router();
const {
  submitProposal, getGigProposals, getMyProposals,
  acceptProposal, rejectProposal, negotiateProposal, withdrawProposal,
} = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('freelancer'), submitProposal);
router.get('/my', authorize('freelancer'), getMyProposals);
router.get('/gig/:gigId', authorize('client'), getGigProposals);
router.put('/:id/accept', authorize('client'), acceptProposal);
router.put('/:id/reject', authorize('client'), rejectProposal);
router.put('/:id/negotiate', negotiateProposal);
router.put('/:id/withdraw', authorize('freelancer'), withdrawProposal);

module.exports = router;
