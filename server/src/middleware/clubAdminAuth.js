import jwt from 'jsonwebtoken';
import ClubAdmin from '../models/ClubAdmin.js';
import { createResponse } from '../utils/response.js';

const authenticateClubAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(createResponse(false, 'Access denied. No token provided.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const clubAdmin = await ClubAdmin.findById(decoded.id).select('-password');
    
    if (!clubAdmin) {
      return res.status(401).json(createResponse(false, 'Invalid token. Club admin not found.'));
    }

    if (!clubAdmin.isActive) {
      return res.status(401).json(createResponse(false, 'Account is deactivated.'));
    }

    req.user = clubAdmin;
    next();
  } catch (error) {
    console.error('Club admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(createResponse(false, 'Invalid token.'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(createResponse(false, 'Token expired.'));
    }
    
    res.status(500).json(createResponse(false, 'Authentication failed.', { error: error.message }));
  }
};

export { authenticateClubAdmin };
