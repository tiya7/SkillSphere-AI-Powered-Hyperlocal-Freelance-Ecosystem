const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  freelancerAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  type: { type: String, enum: ['escrow', 'milestone', 'full', 'refund'], default: 'escrow' },
  status: { type: String, enum: ['pending', 'in_escrow', 'released', 'refunded', 'disputed', 'failed'], default: 'pending' },
  milestoneIndex: { type: Number, default: -1 },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  paidAt: { type: Date },
  releasedAt: { type: Date },
  refundedAt: { type: Date },
  notes: { type: String, default: '' },
}, { timestamps: true });

paymentSchema.index({ gig: 1, client: 1, status: 1 });
paymentSchema.index({ freelancer: 1, status: 1 });
module.exports = mongoose.model('Payment', paymentSchema);
