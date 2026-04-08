const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: { type: String, default: '' },
    industry: { type: String, default: '' },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+', 'individual'],
      default: 'individual',
    },
    website: { type: String, default: '' },
    description: { type: String, default: '' },

    // Stats
    totalSpent: { type: Number, default: 0 },
    totalGigsPosted: { type: Number, default: 0 },
    totalGigsCompleted: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    // Preferences
    preferredCategories: [String],
    preferredBudgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },

    // Verification
    isVerified: { type: Boolean, default: false },
    paymentVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
