const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  type: { type: String, enum: ['text', 'file', 'image', 'system'], default: 'text' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
