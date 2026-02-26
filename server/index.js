import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import createError from 'http-errors';

import { loadEnv } from './src/config/env.js';
import connectDb from './src/config/db.js';
import * as api from './api.js';

loadEnv();

const app = express();

const parseAllowedOrigins = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);
const corsOptions = {
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Static uploads
app.use('/uploads', express.static('uploads'));

// Register API routes from api.js centrally
app.use('/api/auth', api.authRoutes);
app.use('/api/users', api.userRoutes);
app.use('/api/events', api.eventRoutes);
app.use('/api/clubs', api.clubRoutes);
app.use('/api/notifications', api.notificationRoutes);
app.use('/api/calendar', api.calendarRoutes);
app.use('/api/upload', api.uploadRoutes);
app.use('/api/admin', api.adminRoutes);
app.use('/api/club-admin', api.clubAdminRoutes);

// 404 handler
app.use((req, res, next) => next(createError(404, 'Not Found')));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error in request:', req.method, req.url);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: { message: err.message || 'Internal Server Error' }
  });
});

// Start server and connect DB
const start = async () => {
  await connectDb();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on port ${port}`));
};

start();

export default app;
