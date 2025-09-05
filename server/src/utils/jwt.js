import jwt from 'jsonwebtoken';

// Signs a JWT token with given payload and options.
// Defaults to 7 days expiration unless overridden in options.
export const signJwt = (payload, options = {}) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d', ...options });
};
