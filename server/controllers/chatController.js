const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get or create conversation
// @route   POST /api/chat/conversation
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, gigId } = req.body;
    const userId = req.user._id;

    if (userId.toString() === recipientId) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      ...(gigId ? { gig: gigId } : {}),
    }).populate('participants', 'name avatar').populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        gig: gigId || null,
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar').populate('lastMessage');
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) { next(error); }
};

// @desc    Get all conversations for user
// @route   GET /api/chat/conversations
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar isActive')
      .populate('lastMessage')
      .populate('gig', 'title')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) { next(error); }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isParticipant = conversation.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ conversation: req.params.id, isDeleted: false })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Mark messages as read
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (error) { next(error); }
};

// @desc    Send message (REST fallback - Socket.IO is primary)
// @route   POST /api/chat/conversations/:id/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, type = 'text', fileUrl, fileName } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Not found' });

    const isParticipant = conversation.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      content,
      type,
      fileUrl: fileUrl || '',
      fileName: fileName || '',
    });

    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    // Send socket notification
    const io = req.app.get('io');
    const otherParticipants = conversation.participants.filter(p => p.toString() !== req.user._id.toString());
    otherParticipants.forEach(pid => {
      io.to(`user_${pid}`).emit('new_message', { conversationId: req.params.id, message: populated });
    });

    res.status(201).json({ success: true, message: populated });
  } catch (error) { next(error); }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:id
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Not found' });
    if (message.sender.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) { next(error); }
};

// @desc    Upload file for chat
// @route   POST /api/chat/upload
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    res.status(200).json({
      success: true,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
    });
  } catch (error) { next(error); }
};
