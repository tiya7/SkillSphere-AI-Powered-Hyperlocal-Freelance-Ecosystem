const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');
const Freelancer = require('../models/Freelancer');

// @desc    Create gig
// @route   POST /api/gigs
// @access  Private (client)
exports.createGig = async (req, res, next) => {
  try {
    const gig = await Gig.create({ ...req.body, client: req.user._id });
    res.status(201).json({ success: true, message: 'Gig created successfully', gig });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all gigs (marketplace)
// @route   GET /api/gigs
// @access  Public
exports.getGigs = async (req, res, next) => {
  try {
    const {
      search, category, budgetMin, budgetMax,
      skills, location, isRemote, sort, page = 1, limit = 12,
    } = req.query;

    const query = { status: 'open', isApproved: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Budget filter
    if (budgetMin || budgetMax) {
      query.budgetMin = {};
      if (budgetMin) query.budgetMin.$gte = Number(budgetMin);
      if (budgetMax) query.budgetMax = { $lte: Number(budgetMax) };
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillsArray };
    }

    // Location filter
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    if (isRemote === 'true') {
      query['location.isRemote'] = true;
    }

    // Sort options
    let sortObj = { createdAt: -1 };
    if (sort === 'budget_high') sortObj = { budgetMax: -1 };
    if (sort === 'budget_low') sortObj = { budgetMin: 1 };
    if (sort === 'proposals') sortObj = { proposalCount: 1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Gig.countDocuments(query);
    const gigs = await Gig.find(query)
      .populate('client', 'name avatar location')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      gigs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
exports.getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name avatar location bio createdAt')
      .populate('assignedFreelancer', 'name avatar');

    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    // Increment views
    await Gig.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({ success: true, gig });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private (client - owner)
exports.updateGig = async (req, res, next) => {
  try {
    let gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (gig.status === 'in_progress') {
      return res.status(400).json({ success: false, message: 'Cannot edit a gig in progress' });
    }

    gig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Gig updated', gig });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private (client - owner)
exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Proposal.deleteMany({ gig: req.params.id });
    await gig.deleteOne();

    res.status(200).json({ success: true, message: 'Gig deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my gigs (client)
// @route   GET /api/gigs/my/gigs
// @access  Private (client)
exports.getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ client: req.user._id })
      .sort({ createdAt: -1 })
      .populate('assignedFreelancer', 'name avatar');

    res.status(200).json({ success: true, gigs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-matched gigs for freelancer
// @route   GET /api/gigs/matched
// @access  Private (freelancer)
exports.getMatchedGigs = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) return res.status(404).json({ success: false, message: 'Profile not found' });

    const freelancerSkills = freelancer.skills.map((s) => s.name.toLowerCase());

    // Find gigs matching freelancer skills
    const gigs = await Gig.find({
      status: 'open',
      isApproved: true,
      skills: {
        $in: freelancerSkills.map((s) => new RegExp(s, 'i')),
      },
    })
      .populate('client', 'name avatar location')
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate match score for each gig
    const scoredGigs = gigs.map((gig) => {
      const gigSkills = gig.skills.map((s) => s.toLowerCase());
      const matchedSkills = gigSkills.filter((s) =>
        freelancerSkills.some((fs) => fs.includes(s) || s.includes(fs))
      );
      const matchScore = Math.round((matchedSkills.length / Math.max(gigSkills.length, 1)) * 100);
      return { ...gig.toObject(), matchScore };
    });

    // Sort by match score
    scoredGigs.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, gigs: scoredGigs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get gig categories with counts
// @route   GET /api/gigs/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Gig.aggregate([
      { $match: { status: 'open', isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};
