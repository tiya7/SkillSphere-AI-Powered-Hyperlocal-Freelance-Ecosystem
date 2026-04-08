const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get current user's full profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let roleProfile = null;

    if (req.user.role === 'freelancer') {
      roleProfile = await Freelancer.findOne({ user: req.user._id });
    } else if (req.user.role === 'client') {
      roleProfile = await Client.findOne({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      user: user.toPublicProfile(),
      profile: roleProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update base user profile
// @route   PUT /api/profile/update
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'bio', 'location'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: user.toPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // File is already uploaded to Cloudinary via multer middleware
    const avatarUrl = req.file.path;

    // Delete old avatar if exists
    if (req.user.avatar) {
      const publicId = req.user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`skillsphere/avatars/${publicId}`).catch(() => {});
    }

    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    res.status(200).json({ success: true, avatar: avatarUrl, message: 'Avatar updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/profile/freelancer
// @access  Private (freelancer only)
exports.updateFreelancerProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'title', 'skills', 'portfolio', 'certifications', 'workExperience',
      'hourlyRate', 'milestoneRate', 'currency', 'isAvailable',
      'availabilitySlots', 'categories', 'languages', 'githubUrl',
      'linkedinUrl', 'websiteUrl',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await Freelancer.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client profile
// @route   PUT /api/profile/client
// @access  Private (client only)
exports.updateClientProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'companyName', 'industry', 'companySize', 'website',
      'description', 'preferredCategories', 'preferredBudgetRange',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await Client.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Profile updated', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public freelancer profile by ID
// @route   GET /api/profile/freelancer/:id
// @access  Public
exports.getFreelancerProfile = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate(
      'user',
      'name email avatar location bio createdAt'
    );

    if (!freelancer) {
      return res.status(404).json({ success: false, message: 'Freelancer not found' });
    }

    res.status(200).json({ success: true, freelancer });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume (freelancer)
// @route   POST /api/profile/resume
// @access  Private (freelancer only)
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    await Freelancer.findOneAndUpdate(
      { user: req.user._id },
      { resume: { url: req.file.path, uploadedAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      resumeUrl: req.file.path,
      message: 'Resume uploaded',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
