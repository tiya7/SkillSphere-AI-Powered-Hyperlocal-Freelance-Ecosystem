const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
  proposedBy: { type: String, enum: ['client', 'freelancer'] },
  amount: { type: Number },
  message: { type: String },
  proposedAt: { type: Date, default: Date.now },
});

const proposalSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Proposal details
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      maxlength: 2000,
    },
    bidAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    estimatedDays: { type: Number, required: true, min: 1 },
    milestones: [
      {
        title: String,
        amount: Number,
        dueDate: Date,
        description: String,
      },
    ],
    attachments: [{ name: String, url: String }],

    // Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'negotiating'],
      default: 'pending',
    },

    // Negotiation history
    negotiationHistory: [negotiationSchema],
    currentNegotiatedAmount: { type: Number, default: 0 },

    // AI match score
    aiMatchScore: { type: Number, default: 0 },
    skillMatchPercentage: { type: Number, default: 0 },

    // Flags
    isShortlisted: { type: Boolean, default: false },
    viewedByClient: { type: Boolean, default: false },
    viewedAt: { type: Date },
  },
  { timestamps: true }
);

proposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });
proposalSchema.index({ gig: 1, status: 1 });
proposalSchema.index({ freelancer: 1, status: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);
