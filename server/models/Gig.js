const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'approved'],
    default: 'pending',
  },
});

const gigSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: [
        'web_development', 'mobile_development', 'ui_ux_design',
        'graphic_design', 'content_writing', 'digital_marketing',
        'data_science', 'video_editing', 'photography', 'other',
      ],
    },
    skills: [{ type: String }],
    budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    deadline: { type: Date },
    milestones: [milestoneSchema],
    attachments: [{ name: String, url: String, uploadedAt: Date }],
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      isRemote: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    visibility: { type: String, enum: ['public', 'invite_only'], default: 'public' },
    invitedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
    proposalCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    aiMatchScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
gigSchema.index({ title: 'text', description: 'text', skills: 'text' });
gigSchema.index({ category: 1, status: 1 });
gigSchema.index({ budgetMin: 1, budgetMax: 1 });
gigSchema.index({ 'location.city': 1 });
gigSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Gig', gigSchema);
