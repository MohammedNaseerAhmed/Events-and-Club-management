import bcrypt from 'bcryptjs';

// Hashes a plain text password asynchronously with salt rounds = 10
export const hashPassword = async (plain) => {
  if (typeof plain !== 'string' || !plain) throw new Error('Invalid password');
  return bcrypt.hash(plain, 10);
};

// Compares a plain text password against a hashed password asynchronously
export const verifyPassword = async (plain, hash) => {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
};
