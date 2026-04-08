const User = require('../models/User');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');
const Proposal = require('../models/Proposal');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Freelancer = require('../models/Freelancer');
const AdminLog = require('../models/AdminLog');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalFreelancers, totalClients,
      totalGigs, openGigs, activeGigs,
      totalPayments, releasedPayments,
      totalDisputes, openDisputes,
      totalReviews, recentUsers, recentGigs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      Gig.countDocuments(),
      Gig.countDocuments({ status: 'open' }),
      Gig.countDocuments({ status: 'in_progress' }),
      Payment.countDocuments(),
      Payment.aggregate([{ $match: { status: 'released' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Dispute.countDocuments(),
      Dispute.countDocuments({ status: 'open' }),
      Review.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt'),
      Gig.find().sort({ createdAt: -1 }).limit(5).select('title status budgetMin budgetMax category createdAt'),
    ]);

    const totalRevenue = releasedPayments[0]?.total || 0;
    const platformRevenue = Math.round(totalRevenue * 0.10);

    const categoryStats = await Gig.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, freelancers: totalFreelancers, clients: totalClients },
        gigs: { total: totalGigs, open: openGigs, active: activeGigs },
        payments: { total: totalPayments, revenue: totalRevenue, platformRevenue },
        disputes: { total: totalDisputes, open: openDisputes },
        reviews: { total: totalReviews },
      },
      recentUsers, recentGigs, categoryStats,
    });
  } catch (error) { next(error); }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20, suspended } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (suspended === 'true') query.isSuspended = true;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

// @desc    Suspend/unsuspend user
// @route   PUT /api/admin/users/:id/suspend
exports.toggleSuspend = async (req, res, next) => {
  try {
    const { suspend, reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
      isSuspended: suspend,
      suspendedReason: suspend ? reason : '',
    }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await AdminLog.create({ admin: req.user._id, action: suspend ? 'suspend_user' : 'unsuspend_user', targetType: 'user', targetId: user._id });
    res.status(200).json({ success: true, message: `User ${suspend ? 'suspended' : 'unsuspended'}`, user });
  } catch (error) { next(error); }
};

// @desc    Verify freelancer
// @route   PUT /api/admin/freelancers/:id/verify
exports.verifyFreelancer = async (req, res, next) => {
  try {
    const { badge = 'silver' } = req.body;
    const freelancer = await Freelancer.findByIdAndUpdate(req.params.id, { isVerified: true, verificationBadge: badge }, { new: true });
    if (!freelancer) return res.status(404).json({ success: false, message: 'Freelancer not found' });
    await AdminLog.create({ admin: req.user._id, action: 'verify_freelancer', targetType: 'user', targetId: freelancer.user });
    res.status(200).json({ success: true, message: 'Freelancer verified', freelancer });
  } catch (error) { next(error); }
};

// @desc    Approve/reject gig
// @route   PUT /api/admin/gigs/:id/approve
exports.approveGig = async (req, res, next) => {
  try {
    const { approve } = req.body;
    const gig = await Gig.findByIdAndUpdate(req.params.id, { isApproved: approve }, { new: true });
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    await AdminLog.create({ admin: req.user._id, action: approve ? 'approve_gig' : 'reject_gig', targetType: 'gig', targetId: gig._id });
    res.status(200).json({ success: true, message: `Gig ${approve ? 'approved' : 'rejected'}`, gig });
  } catch (error) { next(error); }
};

// @desc    Get admin logs
// @route   GET /api/admin/logs
exports.getAdminLogs = async (req, res, next) => {
  try {
    const logs = await AdminLog.find().populate('admin', 'name').sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, logs });
  } catch (error) { next(error); }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newUsers, newGigs, revenueData, topFreelancers] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Gig.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: 'released', createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Freelancer.find({ isVerified: true }).sort({ reputationScore: -1 }).limit(5).populate('user', 'name avatar'),
    ]);

    res.status(200).json({ success: true, newUsers, newGigs, revenueData, topFreelancers });
  } catch (error) { next(error); }
};
