const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const Freelancer = require('../models/Freelancer');
const Payment = require('../models/Payment');
const { HfInference } = require('@huggingface/inference');

// Initialize Huggingface client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// @desc    Submit proposal
// @route   POST /api/proposals
// @access  Private (freelancer)
exports.submitProposal = async (req, res, next) => {
  try {
    const { gigId, coverLetter, bidAmount, estimatedDays, milestones } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ success: false, message: 'Gig is not open for proposals' });

    // Check already applied
    const existing = await Proposal.findOne({ gig: gigId, freelancer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already submitted a proposal for this gig' });

    // Calculate AI match score
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    let aiMatchScore = 0;
    let skillMatchPercentage = 0;

    if (freelancer) {
      const freelancerSkills = freelancer.skills.map((s) => s.name.toLowerCase());
      const gigSkills = gig.skills.map((s) => s.toLowerCase());
      
      let semanticScore = 0;
      
      try {
        if (freelancerSkills.length > 0 && gigSkills.length > 0) {
          // Use Huggingface miniLM for true semantic similarity
          const similarities = await hf.sentenceSimilarity({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: {
              source_sentence: gigSkills.join(', '),
              sentences: [freelancerSkills.join(', ')]
            }
          });
          semanticScore = similarities[0] || 0;
        }
      } catch (err) {
        console.warn('Huggingface API failed, falling back to basic match', err.message);
        // Fallback matching
        const matched = gigSkills.filter((s) =>
          freelancerSkills.some((fs) => fs.includes(s) || s.includes(fs))
        );
        semanticScore = matched.length / Math.max(gigSkills.length, 1);
      }

      skillMatchPercentage = Math.round(semanticScore * 100);
      
      // Rating component (40%) + semantic skill match (60%)
      const ratingScore = ((freelancer.averageRating || 0) / 5) * 40;
      const skillScore = skillMatchPercentage * 0.6;
      aiMatchScore = Math.round(ratingScore + skillScore);
    }

    const proposal = await Proposal.create({
      gig: gigId,
      freelancer: req.user._id,
      client: gig.client,
      coverLetter,
      bidAmount,
      estimatedDays,
      milestones: milestones || [],
      aiMatchScore,
      skillMatchPercentage,
    });

    // Update gig proposal count
    await Gig.findByIdAndUpdate(gigId, { $inc: { proposalCount: 1 }, $push: { proposals: proposal._id } });

    res.status(201).json({ success: true, message: 'Proposal submitted successfully!', proposal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get proposals for a gig (client view)
// @route   GET /api/proposals/gig/:gigId
// @access  Private (client - owner)
exports.getGigProposals = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const proposals = await Proposal.find({ gig: req.params.gigId })
      .populate('freelancer', 'name avatar location')
      .sort({ aiMatchScore: -1 });

    // Mark as viewed
    await Proposal.updateMany({ gig: req.params.gigId, viewedByClient: false }, { viewedByClient: true, viewedAt: new Date() });

    res.status(200).json({ success: true, proposals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my proposals (freelancer view)
// @route   GET /api/proposals/my
// @access  Private (freelancer)
exports.getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('gig', 'title budgetMin budgetMax status category deadline')
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, proposals });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept proposal
// @route   PUT /api/proposals/:id/accept
// @access  Private (client)
exports.acceptProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

    if (proposal.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Accept this proposal
    proposal.status = 'accepted';
    await proposal.save();

    // Reject all other proposals for this gig
    await Proposal.updateMany(
      { gig: proposal.gig, _id: { $ne: proposal._id } },
      { status: 'rejected' }
    );

    // Update gig status
    await Gig.findByIdAndUpdate(proposal.gig, {
      status: 'in_progress',
      assignedFreelancer: proposal.freelancer,
    });

    // Create a pending payment so the client can fund it on the Payments page
    await Payment.create({
      gig: proposal.gig,
      proposal: proposal._id,
      client: proposal.client,
      freelancer: proposal.freelancer,
      amount: proposal.bidAmount,
      type: 'full',
      status: 'pending',
    });

    res.status(200).json({ success: true, message: 'Proposal accepted! Please proceed to Payments to fund the escrow.', proposal });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject proposal
// @route   PUT /api/proposals/:id/reject
// @access  Private (client)
exports.rejectProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

    if (proposal.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    proposal.status = 'rejected';
    await proposal.save();

    res.status(200).json({ success: true, message: 'Proposal rejected', proposal });
  } catch (error) {
    next(error);
  }
};

// @desc    Negotiate proposal
// @route   PUT /api/proposals/:id/negotiate
// @access  Private (client or freelancer)
exports.negotiateProposal = async (req, res, next) => {
  try {
    const { amount, message } = req.body;
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const isClient = proposal.client.toString() === req.user._id.toString();
    const isFreelancer = proposal.freelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    proposal.status = 'negotiating';
    proposal.currentNegotiatedAmount = amount;
    proposal.negotiationHistory.push({
      proposedBy: isClient ? 'client' : 'freelancer',
      amount,
      message,
    });

    await proposal.save();
    res.status(200).json({ success: true, message: 'Negotiation sent', proposal });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw proposal (freelancer)
// @route   PUT /api/proposals/:id/withdraw
// @access  Private (freelancer)
exports.withdrawProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

    if (proposal.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (proposal.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Cannot withdraw an accepted proposal' });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    await Gig.findByIdAndUpdate(proposal.gig, { $inc: { proposalCount: -1 } });

    res.status(200).json({ success: true, message: 'Proposal withdrawn', proposal });
  } catch (error) {
    next(error);
  }
};
