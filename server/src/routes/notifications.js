import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNotifications, markRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.post('/mark-read', authenticate, markRead);

export default router;
