const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account suspended. Reason: ${user.suspendedReason || 'Contact support'}`,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    // Update last seen
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    res.status(500).json({ success: false, message: 'Server error in auth middleware.' });
  }
};

// Role-Based Access Control (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    // No-op - continue without user
  }
  next();
};

// Require email verification
const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this feature.',
    });
  }
  next();
};

module.exports = { protect, authorize, optionalAuth, requireEmailVerified };
