const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register, login, googleAuth, verifyEmail, resendVerification,
  forgotPassword, resetPassword, refreshToken, logout,
  setupTwoFactor, enableTwoFactor, disableTwoFactor,
  verifyTwoFactorLogin, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', authLimiter, resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/2fa/verify-login', authLimiter, verifyTwoFactorLogin);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.post('/2fa/setup', setupTwoFactor);
router.post('/2fa/enable', enableTwoFactor);
router.post('/2fa/disable', disableTwoFactor);

module.exports = router;
