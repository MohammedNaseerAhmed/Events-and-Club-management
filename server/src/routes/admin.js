import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  listUsers,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js';
import {
  listClubs,
  updateClub,
  deleteClub,
} from '../controllers/adminController.js';
import {
  listEvents,
  updateEvent,
  deleteEvent,
} from '../controllers/adminController.js';
import {
  listNotifications,
  updateNotification,
  deleteNotification,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply authentication and admin role verification globally to all admin routes
router.use(auth, requireRole('admin'));

// User management routes
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Club management routes
router.get('/clubs', listClubs);
router.put('/clubs/:id', updateClub);
router.delete('/clubs/:id', deleteClub);

// Event management routes
router.get('/events', listEvents);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Notification management routes
router.get('/notifications', listNotifications);
router.put('/notifications/:id', updateNotification);
router.delete('/notifications/:id', deleteNotification);

export default router;
