const Notification = require('../models/Notification');

// @desc    Get notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, notifications, total, unreadCount, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) { next(error); }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};

// Helper to create notification
exports.createNotification = async ({ recipient, type, title, message, link = '', data = {} }) => {
  try {
    return await Notification.create({ recipient, type, title, message, link, data });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};
