import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verify JWT and attach req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { message: 'No token provided' } });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ success: false, error: { message: 'User not found' } });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { message: 'Invalid/expired token' } });
  }
};

/**
 * Optional auth - attaches user if token provided, continues even without
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
    }
  } catch (_) { }
  next();
};

/**
 * Role-based access control
 * Usage: ensureRole('admin') or ensureRole('admin', 'clubHead')
 */
export const ensureRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthenticated' } });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: { message: 'Forbidden: insufficient role' } });
  }
  next();
};

/**
 * Ensures the authenticated user is a head of the specified organization
 * Usage: ensureOrgHead('clubId') where 'clubId' is the route param name
 */
export const ensureOrgHead = (paramName = 'clubId') => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthenticated' } });
  // Admins bypass org head check
  if (req.user.role === 'admin') return next();
  const orgId = req.params[paramName];
  const isHead = req.user.organizationsOwned?.some((id) => id.toString() === orgId);
  if (!isHead) {
    return res.status(403).json({ success: false, error: { message: 'Forbidden: not a head of this organization' } });
  }
  next();
};
