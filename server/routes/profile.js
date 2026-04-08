const express = require('express');
const router = express.Router();
const {
  getMyProfile, updateProfile, uploadAvatar,
  updateFreelancerProfile, updateClientProfile,
  getFreelancerProfile, uploadResume, changePassword,
} = require('../controllers/profileController');
const { protect, authorize, requireEmailVerified } = require('../middleware/auth');
const { uploadAvatar: multerAvatar, uploadResume: multerResume } = require('../config/cloudinary');

router.use(protect); // All profile routes require auth

router.get('/me', getMyProfile);
router.put('/update', updateProfile);
router.post('/avatar', multerAvatar.single('avatar'), uploadAvatar);
router.put('/change-password', changePassword);

// Freelancer-specific
router.put('/freelancer', authorize('freelancer'), requireEmailVerified, updateFreelancerProfile);
router.post('/resume', authorize('freelancer'), multerResume.single('resume'), uploadResume);

// Client-specific
router.put('/client', authorize('client'), requireEmailVerified, updateClientProfile);

// Public
router.get('/freelancer/:id', getFreelancerProfile);

module.exports = router;
