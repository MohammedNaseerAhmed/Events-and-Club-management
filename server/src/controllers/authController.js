import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';
import { recordFailedLogin, clearFailedLogins } from '../middleware/loginLockout.js';
import crypto from 'crypto';
import { sendEmailVerificationOtp, sendWelcomeEmail } from '../utils/email.js';

const generateToken = (user, expiresIn = '7d') =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn });

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');
const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  emailVerified: !!user.emailVerified,
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

    const otpCode = generateOtp();
    const otpHash = hashOtp(otpCode);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.create({
      name,
      username: username.toLowerCase(),
      email,
      passwordHash,
      role: userRole,
      emailVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationOtpExpiresAt: otpExpiry,
      emailVerificationOtpSentAt: new Date(),
    });

    await sendEmailVerificationOtp(email, name, otpCode);

    res.status(201).json({
      success: true,
      data: {
        requiresVerification: true,
        email,
        message: 'OTP sent to your email. Please verify to complete signup.',
      },
    });
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
    if (!user) {
      recordFailedLogin(req, res);
      return res.status(400).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, error: { message: 'Please verify your email with OTP before login.' } });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      recordFailedLogin(req, res);
      return res.status(400).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    clearFailedLogins(req, res);
    const token = generateToken(user);
    res.json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-email
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: { message: 'email and otp are required' } });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    if (user.emailVerified) {
      const token = generateToken(user);
      return res.json({ success: true, data: { token, user: safeUser(user), alreadyVerified: true } });
    }

    if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpiresAt) {
      return res.status(400).json({ success: false, error: { message: 'OTP not generated. Please resend OTP.' } });
    }
    if (user.emailVerificationOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: { message: 'OTP expired. Please resend OTP.' } });
    }

    const incomingHash = hashOtp(otp);
    if (incomingHash !== user.emailVerificationOtpHash) {
      return res.status(400).json({ success: false, error: { message: 'Invalid OTP' } });
    }

    user.emailVerified = true;
    user.emailVerificationOtpHash = '';
    user.emailVerificationOtpExpiresAt = null;
    await user.save();

    // Non-blocking welcome mail.
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    const token = generateToken(user);
    return res.json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-otp
export const resendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: { message: 'email is required' } });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    if (user.emailVerified) return res.status(400).json({ success: false, error: { message: 'Email already verified' } });

    if (user.emailVerificationOtpSentAt && Date.now() - user.emailVerificationOtpSentAt.getTime() < 60 * 1000) {
      return res.status(429).json({ success: false, error: { message: 'Please wait before requesting another OTP.' } });
    }

    const otpCode = generateOtp();
    user.emailVerificationOtpHash = hashOtp(otpCode);
    user.emailVerificationOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationOtpSentAt = new Date();
    await user.save();

    await sendEmailVerificationOtp(user.email, user.name, otpCode);
    return res.json({ success: true, data: { message: 'OTP resent successfully' } });
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
