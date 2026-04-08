const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, getGigReviews, flagReview, getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/user/:userId', getUserReviews);
router.get('/gig/:gigId', getGigReviews);
router.use(protect);
router.post('/', createReview);
router.get('/me', getMyReviews);
router.put('/:id/flag', flagReview);
module.exports = router;
