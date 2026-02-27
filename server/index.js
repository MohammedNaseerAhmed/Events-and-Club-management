import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';

import { loadEnv } from './src/config/env.js';
import connectDb from './src/config/db.js';
import { setIo } from './src/utils/notificationEmitter.js';
import User from './src/models/User.js';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import Notification from './src/models/Notification.js';

// Routes
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';
import orgRoutes from './src/routes/organizations.js';
import feedRoutes from './src/routes/feed.js';
import notificationRoutes from './src/routes/notifications.js';
import networkRoutes from './src/routes/network.js';
import chatRoutes from './src/routes/chat.js';
import documentRoutes from './src/routes/documents.js';
import userRoutes from './src/routes/user.js';
import chaptersRoutes from './src/routes/chapters.js';
import uploadRoutes from './src/routes/uploads.js';

loadEnv();

const app = express();
const httpServer = createServer(app);

const parseAllowedOrigins = (value) => {
  if (!value) return [];
  return value.split(',').map((o) => o.trim()).filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);
const corsOptions = {
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
};

// ─── Socket.io Setup ───────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Online users map: userId → socketId
const onlineUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);
  socket.join(`user_${userId}`); // Personal room for notifications

  // Join conversation rooms
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conv_${conversationId}`);
  });

  // Send message via socket
  socket.on('send_message', async ({ conversationId, content, attachments }, callback) => {
    try {
      const conversation = await Conversation.findOne({ _id: conversationId, participantIds: socket.user._id });
      if (!conversation) return callback?.({ error: 'Not in conversation' });

      const message = await Message.create({
        conversationId,
        senderId: socket.user._id,
        content,
        attachments: attachments || [],
      });

      conversation.lastMessageAt = new Date();
      conversation.lastMessage = content?.substring(0, 100) || '';
      await conversation.save();

      await message.populate('senderId', 'name username profilePicUrl');

      // Broadcast to all in conversation room
      io.to(`conv_${conversationId}`).emit('new_message', { message, conversationId });

      // Notify offline participants
      for (const participantId of conversation.participantIds) {
        const pid = participantId.toString();
        if (pid !== userId) {
          // Create notification
          await Notification.create({
            userId: participantId,
            type: 'message',
            title: `${socket.user.name}`,
            body: content?.substring(0, 100) || 'Sent an attachment',
            payload: { conversationId, senderId: userId },
          });
          // Emit notification to user's personal room
          io.to(`user_${pid}`).emit('new_notification', { type: 'message', senderId: userId, conversationId });
        }
      }

      callback?.({ success: true, message });
    } catch (err) {
      callback?.({ error: err.message });
    }
  });

  socket.on('typing', ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit('user_typing', { userId, conversationId });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit('user_stop_typing', { userId, conversationId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
  });
});

setIo(io);

// Export io for use in controllers
export { io };

// ─── Express Middleware ────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many auth requests' } }));
app.use('/api/network/invite', rateLimit({ windowMs: 60 * 1000, max: 10 }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// Health check
app.get('/health', (req, res) => res.json({ ok: true, timestamp: new Date() }));

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', orgRoutes);        // /api/organizations, /api/clubs, /api/events
app.use('/api/feed', feedRoutes);  // GET /api/feed, POST /api/posts
app.use('/api/notifications', notificationRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api', chaptersRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res, next) => next(createError(404, 'Not Found')));

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${req.method}] ${req.url} →`, err.message);
  res.status(err.status || 500).json({
    success: false,
    error: { message: err.message || 'Internal Server Error' },
  });
});

// ─── Start ─────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDb();
  const port = process.env.PORT || 5000;
  httpServer.listen(port, () => console.log(`🚀 Server running on port ${port}`));
};

start();

export default app;
