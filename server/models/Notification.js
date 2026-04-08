const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_proposal', 'proposal_accepted', 'proposal_rejected', 'new_message',
           'payment_received', 'payment_released', 'review_added', 'gig_completed',
           'dispute_opened', 'dispute_resolved', 'milestone_approved', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
