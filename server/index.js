require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const gigRoutes = require('./routes/gigs');
const proposalRoutes = require('./routes/proposals');
const searchRoutes = require('./routes/search');
const chatRoutes = require('./routes/chat');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const disputeRoutes = require('./routes/disputes');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

// Connect DB
connectDB();

// Security
app.use(helmet({ crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } }));
app.use(cors({ origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'], credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { success: false, message: 'Too many requests' } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'SkillSphere API running', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

// ─── Socket.IO Real-time Chat ─────────────────────────────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    onlineUsers.set(userId, socket.id);
    io.emit('user_online', { userId, online: true });
    console.log(`✅ User ${userId} joined`);
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conv_${conversationId}`);
  });

  // Send message via socket
  socket.on('send_message', async (data) => {
    const { conversationId, message } = data;
    // Broadcast to all in conversation room except sender
    socket.to(`conv_${conversationId}`).emit('new_message', { conversationId, message });
    // Also send notification to recipient's personal room
    if (message.recipientId) {
      io.to(`user_${message.recipientId}`).emit('message_notification', {
        conversationId,
        senderName: message.sender?.name,
        preview: message.content?.substring(0, 50),
      });
    }
  });

  // Typing indicator
  socket.on('typing_start', (data) => {
    socket.to(`conv_${data.conversationId}`).emit('user_typing', { userId: data.userId, name: data.name });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`conv_${data.conversationId}`).emit('user_stopped_typing', { userId: data.userId });
  });

  // Mark messages as read
  socket.on('mark_read', (data) => {
    socket.to(`conv_${data.conversationId}`).emit('messages_read', { userId: data.userId, conversationId: data.conversationId });
  });

  // --- WebRTC Video Call Signaling ---
  socket.on('call_user', ({ userToCall, signalData, from, name }) => {
    io.to(`user_${userToCall}`).emit('incoming_call', { signal: signalData, from, name });
  });

  socket.on('answer_call', (data) => {
    io.to(`user_${data.to}`).emit('call_accepted', data.signal);
  });

  socket.on('reject_call', ({ to }) => {
    io.to(`user_${to}`).emit('call_rejected');
  });

  socket.on('end_call', ({ to }) => {
    io.to(`user_${to}`).emit('call_ended');
  });

  socket.on('webrtc_ice_candidate', ({ to, candidate }) => {
    io.to(`user_${to}`).emit('webrtc_ice_candidate', candidate);
  });
  // ------------------------------------

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user_online', { userId, online: false });
        break;
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SkillSphere server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
