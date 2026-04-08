const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const AdminLog = require('../models/AdminLog');
const { createNotification } = require('./notificationController');

// @desc    Open dispute
// @route   POST /api/disputes
exports.openDispute = async (req, res, next) => {
  try {
    const { gigId, paymentId, againstId, reason, evidenceUrls } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const existing = await Dispute.findOne({ payment: paymentId });
    if (existing) return res.status(400).json({ success: false, message: 'Dispute already exists for this payment' });

    const dispute = await Dispute.create({
      gig: gigId, payment: paymentId,
      raisedBy: req.user._id, against: againstId,
      reason, evidenceUrls: evidenceUrls || [],
    });

    // Put payment on hold
    await Payment.findByIdAndUpdate(paymentId, { status: 'disputed' });

    await createNotification({
      recipient: againstId, type: 'dispute_opened',
      title: 'Dispute Opened Against You',
      message: 'A dispute has been raised. An admin will review it shortly.',
      link: `/disputes/${dispute._id}`,
    });

    res.status(201).json({ success: true, message: 'Dispute opened. Admin will review within 48 hours.', dispute });
  } catch (error) { next(error); }
};

// @desc    Get my disputes
// @route   GET /api/disputes/my
exports.getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ $or: [{ raisedBy: req.user._id }, { against: req.user._id }] })
      .populate('gig', 'title').populate('raisedBy', 'name avatar').populate('against', 'name avatar')
      .populate('payment', 'amount status').sort({ createdAt: -1 });
    res.status(200).json({ success: true, disputes });
  } catch (error) { next(error); }
};

// @desc    Get all disputes (admin)
// @route   GET /api/disputes
exports.getAllDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Dispute.countDocuments(query);
    const disputes = await Dispute.find(query)
      .populate('gig', 'title').populate('raisedBy', 'name email avatar')
      .populate('against', 'name email avatar').populate('payment', 'amount')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({ success: true, disputes, total, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

// @desc    Resolve dispute (admin)
// @route   PUT /api/disputes/:id/resolve
exports.resolveDispute = async (req, res, next) => {
  try {
    const { resolution, favor, adminNotes } = req.body;
    const dispute = await Dispute.findById(req.params.id).populate('payment');
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    const status = favor === 'client' ? 'resolved_client' : 'resolved_freelancer';
    dispute.status = status;
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    dispute.adminNotes = adminNotes || '';
    await dispute.save();

    // Update payment
    const paymentStatus = favor === 'client' ? 'refunded' : 'released';
    await Payment.findByIdAndUpdate(dispute.payment._id, { status: paymentStatus });

    // Log admin action
    await AdminLog.create({ admin: req.user._id, action: 'resolve_dispute', targetType: 'dispute', targetId: dispute._id, details: { favor, resolution } });

    // Notify both parties
    await createNotification({ recipient: dispute.raisedBy, type: 'dispute_resolved', title: 'Dispute Resolved', message: `Your dispute has been resolved in favor of ${favor === 'client' ? 'you' : 'the other party'}.`, link: `/disputes` });
    await createNotification({ recipient: dispute.against, type: 'dispute_resolved', title: 'Dispute Resolved', message: `The dispute has been resolved in favor of ${favor === 'freelancer' ? 'you' : 'the other party'}.`, link: `/disputes` });

    res.status(200).json({ success: true, message: 'Dispute resolved', dispute });
  } catch (error) { next(error); }
};
