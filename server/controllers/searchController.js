const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Gig = require('../models/Gig');

// @desc    Search freelancers
// @route   GET /api/search/freelancers
// @access  Public
exports.searchFreelancers = async (req, res, next) => {
  try {
    const { q, skills, city, minRate, maxRate, rating, sort, page = 1, limit = 12 } = req.query;

    // Build freelancer query
    const freelancerQuery = { isAvailable: true };

    if (skills) {
      const skillsArr = skills.split(',').map(s => s.trim());
      freelancerQuery['skills.name'] = { $in: skillsArr.map(s => new RegExp(s, 'i')) };
    }
    if (minRate) freelancerQuery.hourlyRate = { $gte: Number(minRate) };
    if (maxRate) freelancerQuery.hourlyRate = { ...freelancerQuery.hourlyRate, $lte: Number(maxRate) };
    if (rating) freelancerQuery.averageRating = { $gte: Number(rating) };

    // Build user query for name/city search
    const userQuery = { role: 'freelancer', isActive: true, isSuspended: false };
    if (q) userQuery.$or = [
      { name: { $regex: q, $options: 'i' } },
      { bio: { $regex: q, $options: 'i' } },
    ];
    if (city) userQuery['location.city'] = { $regex: city, $options: 'i' };

    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    if (q || city) freelancerQuery.user = { $in: userIds };

    let sortObj = { reputationScore: -1 };
    if (sort === 'rate_low') sortObj = { hourlyRate: 1 };
    if (sort === 'rate_high') sortObj = { hourlyRate: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Freelancer.countDocuments(freelancerQuery);
    const freelancers = await Freelancer.find(freelancerQuery)
      .populate('user', 'name avatar bio location createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      freelancers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get freelancer public profile
// @route   GET /api/search/freelancers/:id
// @access  Public
exports.getFreelancerPublicProfile = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id)
      .populate('user', 'name avatar bio location createdAt');
    if (!freelancer) return res.status(404).json({ success: false, message: 'Freelancer not found' });
    res.status(200).json({ success: true, freelancer });
  } catch (error) {
    next(error);
  }
};

// @desc    Global search
// @route   GET /api/search
// @access  Public
exports.globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, gigs: [], freelancers: [] });

    const [gigs, users] = await Promise.all([
      Gig.find({ status: 'open', $text: { $search: q } })
        .select('title category budgetMin budgetMax')
        .limit(5),
      User.find({ role: 'freelancer', name: { $regex: q, $options: 'i' } })
        .select('name avatar')
        .limit(5),
    ]);

    res.status(200).json({ success: true, gigs, freelancers: users });
  } catch (error) {
    next(error);
  }
};
