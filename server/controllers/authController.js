const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const { sendTokenResponse, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../utils/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({ name, email, password, role: role || 'client' });

    // Create role-specific profile
    if (user.role === 'freelancer') {
      await Freelancer.create({ user: user._id, title: 'Freelancer' });
    } else if (user.role === 'client') {
      await Client.create({ user: user._id });
    }

    // Send verification email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account suspended: ${user.suspendedReason}`,
      });
    }

    // If 2FA enabled, return partial token requiring OTP
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        userId: user._id,
        message: 'Please enter your 2FA code',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/2fa/verify-login
// @access  Public
exports.verifyTwoFactorLogin = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // New user via Google
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        authProvider: 'google',
        role: role || 'client',
        isEmailVerified: true, // Google emails are pre-verified
      });

      if (user.role === 'freelancer') {
        await Freelancer.create({ user: user._id, title: 'Freelancer' });
      } else if (user.role === 'client') {
        await Client.create({ user: user._id });
      }

      await sendWelcomeEmail(user);
    } else {
      // Existing user - update Google info
      user.googleId = googleId;
      user.authProvider = 'google';
      if (!user.avatar) user.avatar = picture;
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }

    sendTokenResponse(user, 200, res, 'Google authentication successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await sendWelcomeEmail(user);

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'If this email exists, a reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public (uses httpOnly cookie)
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token expired' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('refreshToken', '', { maxAge: 0, httpOnly: true }).status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Setup 2FA - get QR code
// @route   POST /api/auth/2fa/setup
// @access  Private
exports.setupTwoFactor = async (req, res, next) => {
  try {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(req.user.email, 'SkillSphere', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Temporarily store secret (not yet enabled)
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret });

    res.status(200).json({
      success: true,
      qrCode: qrCodeDataUrl,
      secret,
      message: 'Scan the QR code with your authenticator app, then confirm with a valid code.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enable 2FA after verifying OTP
// @route   POST /api/auth/2fa/enable
// @access  Private
exports.enableTwoFactor = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid code. Try again.' });
    }

    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });

    res.status(200).json({ success: true, message: '2FA enabled successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disableTwoFactor = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid code.' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: '',
    });

    res.status(200).json({ success: true, message: '2FA disabled.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toPublicProfile() });
};
