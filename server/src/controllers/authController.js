import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';

const generateToken = (user, expiresIn = '7d') =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn });

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  profilePicUrl: user.profilePicUrl,
  bio: user.bio,
  headline: user.headline,
  organizationsOwned: user.organizationsOwned,
  followingOrgs: user.followingOrgs,
});

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, error: { message: 'name, username, email, password are required' } });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ success: false, error: { message: 'Email already registered' } });

    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) return res.status(400).json({ success: false, error: { message: 'Username already taken' } });

    const allowedRoles = ['student', 'clubHead', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, username: username.toLowerCase(), email, passwordHash, role: userRole });
    const token = generateToken(user);

    res.status(201).json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password required' } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: { message: 'Invalid credentials' } });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, error: { message: 'Invalid credentials' } });

    const token = generateToken(user);
    res.json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').populate('organizationsOwned', 'name shortName logoUrl');
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    // Unread notification count
    const unreadCount = await Notification.countDocuments({ userId: user._id, read: false });
    res.json({ success: true, data: { user, unreadCount } });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};
