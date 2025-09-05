import express from 'express';
import {
  createNotification,
  updateNotification,
  deleteNotification,
  getNotification,
  listNotifications,
  recentNotifications,
} from '../controllers/notificationController.js';

const router = express.Router();

// TODO: Add authentication and admin authorization middleware where applicable

// Create a new notification (Admin)
router.post('/', createNotification);

// Update notification by ID (Admin)
router.put('/:id', updateNotification);

// Delete notification by ID (Admin)
router.delete('/:id', deleteNotification);

// Get recent notifications (public or protected)
router.get('/recent', recentNotifications);

// Get notification details by ID
router.get('/:id', getNotification);

// List all notifications with pagination and filtering
router.get('/', listNotifications);

export default router;
