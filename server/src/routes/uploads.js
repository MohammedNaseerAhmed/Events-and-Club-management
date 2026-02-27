import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { authenticate, ensureRole } from '../middleware/auth.js';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir('uploads');
ensureDir('uploads/avatars');

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png'];
const AVATAR_MAX_SIZE = 2 * 1024 * 1024;

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safe = `${req.user._id}_${Date.now()}${ext}`;
    cb(null, safe);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: AVATAR_MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG and PNG images are allowed'));
  },
});

const router = express.Router();

router.post(
  '/avatar',
  authenticate,
  (req, res, next) => {
    avatarUpload.single('avatar')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, error: { message: 'File too large. Max 2MB.' } });
        return res.status(400).json({ success: false, error: { message: err.message || 'Invalid file' } });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      const baseUrl = process.env.API_BASE_URL || '';
      const url = baseUrl ? `${baseUrl.replace(/\/api\/?$/, '')}/uploads/avatars/${req.file.filename}` : `/uploads/avatars/${req.file.filename}`;
      await User.findByIdAndUpdate(req.user._id, { profilePicUrl: url });
      res.json({ success: true, data: { url } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
