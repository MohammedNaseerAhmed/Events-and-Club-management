// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Auth middleware: verifies bearer token and populates req.user
export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: { message: 'Unauthorized: No token provided' } });
  }

  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user document (excluding passwordHash) to req.user
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) throw new Error('User not found');

    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
};

// Role-based middleware: allows only users with specified role
export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: { message: 'Forbidden: insufficient role' } });
  }
  next();
};
