const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'intermediate',
  },
});

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  projectUrl: { type: String, default: '' },
  technologies: [String],
  completedAt: { type: Date },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialUrl: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
});

const workExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
});

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  startTime: String,
  endTime: String,
});

const freelancerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    skills: [skillSchema],
    portfolio: [portfolioItemSchema],
    resume: {
      url: { type: String, default: '' },
      uploadedAt: { type: Date },
    },
    certifications: [certificationSchema],
    workExperience: [workExperienceSchema],

    // Pricing
    hourlyRate: { type: Number, default: 0, min: 0 },
    milestoneRate: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },

    // Availability
    isAvailable: { type: Boolean, default: true },
    availabilitySlots: [availabilitySlotSchema],

    // Stats
    totalEarnings: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    successRate: { type: Number, default: 0 },

    // Reputation
    reputationScore: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    verificationBadge: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold'],
      default: 'none',
    },

    // Categories
    categories: [String],
    languages: [String],

    // Social links
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Update reputation score on save
freelancerSchema.pre('save', function (next) {
  if (this.totalRatings > 0) {
    // Weighted score: rating (60%) + completion rate (25%) + verification (15%)
    const ratingScore = (this.averageRating / 5) * 60;
    const completionScore = Math.min(this.successRate, 100) * 0.25;
    const verificationScore = this.isVerified ? 15 : 0;
    this.reputationScore = Math.round(ratingScore + completionScore + verificationScore);
  }
  next();
});

module.exports = mongoose.model('Freelancer', freelancerSchema);
