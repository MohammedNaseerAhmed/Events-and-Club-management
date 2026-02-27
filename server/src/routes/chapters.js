import express from 'express';
import { authenticate, ensureRole, ensureOrgHead, optionalAuth } from '../middleware/auth.js';
import { chapterUpdateValidator, joinRequestValidator } from '../middleware/validators.js';
import {
  listChapters,
  getChapterById,
  updateChapter,
  submitJoinRequest,
  listJoinRequests,
  reviewJoinRequest,
  addGalleryImage,
  dashboardStats,
} from '../controllers/chaptersController.js';

const router = express.Router();

router.get('/chapters/stats', optionalAuth, dashboardStats);
router.get('/chapters', optionalAuth, listChapters);
router.get('/chapters/:id', optionalAuth, getChapterById);

router.patch(
  '/chapters/:id',
  authenticate,
  ensureOrgHead('id'),
  chapterUpdateValidator,
  updateChapter
);

router.post(
  '/chapters/:id/join',
  optionalAuth,
  joinRequestValidator,
  submitJoinRequest
);

router.get(
  '/chapters/:id/join-requests',
  authenticate,
  ensureOrgHead('id'),
  listJoinRequests
);

router.patch(
  '/chapters/:id/join-requests/:requestId',
  authenticate,
  ensureOrgHead('id'),
  reviewJoinRequest
);

router.post(
  '/chapters/:id/gallery',
  authenticate,
  ensureOrgHead('id'),
  addGalleryImage
);

export default router;
