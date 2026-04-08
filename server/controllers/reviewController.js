const Review = require('../models/Review');
const Freelancer = require('../models/Freelancer');
const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');

// @desc    Create review
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { gigId, proposalId, revieweeId, rating, comment, categories, type } = req.body;

    // Validate proposal exists and is accepted
    const proposal = await Proposal.findById(proposalId);
    if (!proposal || proposal.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Can only review completed projects' });
    }

    // Check already reviewed
    const existing = await Review.findOne({ proposal: proposalId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this project' });

    const review = await Review.create({
      gig: gigId, proposal: proposalId,
      reviewer: req.user._id, reviewee: revieweeId,
      rating, comment, type,
      categories: categories || { communication: 5, quality: 5, timeliness: 5, professionalism: 5 },
    });

    // Update freelancer avg rating if reviewed by client
    if (type === 'client_to_freelancer') {
      const allReviews = await Review.find({ reviewee: revieweeId, type: 'client_to_freelancer' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Freelancer.findOneAndUpdate({ user: revieweeId }, {
        averageRating: Math.round(avg * 10) / 10,
        totalRatings: allReviews.length,
      });
    }

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar');

    res.status(201).json({ success: true, message: 'Review submitted!', review: populated });
  } catch (error) { next(error); }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId, isFlagged: false })
      .populate('reviewer', 'name avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.status(200).json({ success: true, reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch (error) { next(error); }
};

// @desc    Get review for a gig
// @route   GET /api/reviews/gig/:gigId
exports.getGigReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId })
      .populate('reviewer', 'name avatar').sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) { next(error); }
};

// @desc    Flag review
// @route   PUT /api/reviews/:id/flag
exports.flagReview = async (req, res, next) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { isFlagged: true, flagReason: req.body.reason });
    res.status(200).json({ success: true, message: 'Review flagged for moderation' });
  } catch (error) { next(error); }
};

// @desc    Get my reviews given & received
// @route   GET /api/reviews/me
exports.getMyReviews = async (req, res, next) => {
  try {
    const [given, received] = await Promise.all([
      Review.find({ reviewer: req.user._id }).populate('reviewee', 'name avatar').populate('gig', 'title').sort({ createdAt: -1 }),
      Review.find({ reviewee: req.user._id }).populate('reviewer', 'name avatar').populate('gig', 'title').sort({ createdAt: -1 }),
    ]);
    res.status(200).json({ success: true, given, received });
  } catch (error) { next(error); }
};
