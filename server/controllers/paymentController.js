const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');
const Freelancer = require('../models/Freelancer');
const { createNotification } = require('./notificationController');

// Platform fee percentage
const PLATFORM_FEE = 0.10; // 10%

// Razorpay instance (lazy init so server starts even without keys)
let razorpay;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// @desc    Initiate payment – creates Razorpay order + Payment record
// @route   POST /api/payments/initiate
exports.initiatePayment = async (req, res, next) => {
  try {
    const { gigId, proposalId, amount, type = 'escrow', milestoneIndex = -1 } = req.body;

    const gig = await Gig.findById(gigId);
    const proposal = await Proposal.findById(proposalId);
    if (!gig || !proposal)
      return res.status(404).json({ success: false, message: 'Gig or proposal not found' });
    if (gig.client.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const platformFee = Math.round(amount * PLATFORM_FEE);
    const freelancerAmount = amount - platformFee;

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(amount * 100), // convert ₹ to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        gigId: gigId.toString(),
        proposalId: proposalId.toString(),
        clientId: req.user._id.toString(),
      },
    });

    // Save payment record with pending status until Razorpay confirms
    const payment = await Payment.create({
      gig: gigId,
      proposal: proposalId,
      client: req.user._id,
      freelancer: proposal.freelancer,
      amount,
      platformFee,
      freelancerAmount,
      type,
      milestoneIndex,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      notes: `Payment for gig: ${gig.title}`,
    });

    res.status(201).json({
      success: true,
      message: 'Order created. Complete payment to fund escrow.',
      payment,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) { next(error); }
};

// @desc    Verify Razorpay payment signature and move payment to escrow
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    // 1. Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed – invalid signature' });
    }

    // 2. Update payment status to in_escrow
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'in_escrow',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      },
      { new: true }
    ).populate('gig', 'title');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    // 3. Notify freelancer
    await createNotification({
      recipient: payment.freelancer,
      type: 'payment_received',
      title: 'Payment in Escrow',
      message: `₹${payment.amount.toLocaleString()} has been placed in escrow for "${payment.gig?.title}"`,
      link: `/payments`,
      data: { paymentId: payment._id },
    });

    res.status(200).json({ success: true, message: 'Payment verified and placed in escrow!', payment });
  } catch (error) { next(error); }
};

// @desc    Release payment to freelancer
// @route   PUT /api/payments/:id/release
exports.releasePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('gig');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.client.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (payment.status !== 'in_escrow')
      return res.status(400).json({ success: false, message: 'Payment not in escrow' });

    payment.status = 'released';
    payment.releasedAt = new Date();
    await payment.save();

    // Update freelancer earnings
    await Freelancer.findOneAndUpdate(
      { user: payment.freelancer },
      { $inc: { totalEarnings: payment.freelancerAmount } }
    );

    // Notify freelancer
    await createNotification({
      recipient: payment.freelancer,
      type: 'payment_released',
      title: 'Payment Released!',
      message: `₹${payment.freelancerAmount.toLocaleString()} has been released to your account`,
      link: `/payments`,
    });

    res.status(200).json({ success: true, message: 'Payment released to freelancer!', payment });
  } catch (error) { next(error); }
};

// @desc    Get my payments
// @route   GET /api/payments/my
exports.getMyPayments = async (req, res, next) => {
  try {
    const query = req.user.role === 'client'
      ? { client: req.user._id }
      : { freelancer: req.user._id };

    const payments = await Payment.find(query)
      .populate('gig', 'title category')
      .populate('client', 'name avatar')
      .populate('freelancer', 'name avatar')
      .sort({ createdAt: -1 });

    const stats = {
      total: payments.reduce((sum, p) => sum + p.amount, 0),
      inEscrow: payments.filter(p => p.status === 'in_escrow').reduce((sum, p) => sum + p.amount, 0),
      released: payments.filter(p => p.status === 'released').reduce((sum, p) => sum + p.freelancerAmount, 0),
      count: payments.length,
    };

    res.status(200).json({ success: true, payments, stats });
  } catch (error) { next(error); }
};

// @desc    Refund payment
// @route   PUT /api/payments/:id/refund
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    if (payment.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (payment.status !== 'in_escrow')
      return res.status(400).json({ success: false, message: 'Can only refund escrow payments' });

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();

    res.status(200).json({ success: true, message: 'Payment refunded', payment });
  } catch (error) { next(error); }
};
