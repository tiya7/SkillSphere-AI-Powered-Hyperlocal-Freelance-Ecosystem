const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000, default: '' },
  type: { type: String, enum: ['client_to_freelancer', 'freelancer_to_client'] },
  categories: {
    communication: { type: Number, min: 1, max: 5, default: 5 },
    quality: { type: Number, min: 1, max: 5, default: 5 },
    timeliness: { type: Number, min: 1, max: 5, default: 5 },
    professionalism: { type: Number, min: 1, max: 5, default: 5 },
  },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
}, { timestamps: true });

reviewSchema.index({ reviewee: 1, rating: -1 });
reviewSchema.index({ gig: 1 });
module.exports = mongoose.model('Review', reviewSchema);
