import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, requireRole } from '../middleware/auth.js';
import { ok } from '../utils/response.js';

// Ensure the uploads directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir('uploads');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({ storage });
const router = express.Router();

// Upload event poster (admin only)
router.post(
  '/event-poster',
  auth,
  requireRole('admin'),
  upload.single('poster'),
  (req, res) => {
    const url = `/uploads/${req.file.filename}`;
    return ok(res, { url, filename: req.file.filename });
  }
);

// Upload club logo (admin only)
router.post(
  '/club-logo',
  auth,
  requireRole('admin'),
  upload.single('logo'),
  (req, res) => {
    const url = `/uploads/${req.file.filename}`;
    return ok(res, { url, filename: req.file.filename });
  }
);

export default router;
