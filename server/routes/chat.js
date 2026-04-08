const express = require('express');
const router = express.Router();
const { getOrCreateConversation, getConversations, getMessages, sendMessage, deleteMessage, uploadFile } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { uploadChatAttachment } = require('../config/cloudinary');

router.use(protect);
router.post('/upload', uploadChatAttachment.single('file'), uploadFile);
router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.delete('/messages/:id', deleteMessage);
module.exports = router;
