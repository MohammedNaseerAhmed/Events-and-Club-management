import express from 'express';
import {
  getClubDetails,
  updateClubDetails,
  getClubEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPoster,
  recruitUsers,
  getProfile,
  updateProfile
} from '../controllers/clubAdminController.js';
import { authenticateClubAdmin } from '../middleware/clubAdminAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateClubAdmin);

// Club management routes
router.get('/club', getClubDetails);
router.put('/club', updateClubDetails);

// Event management routes
router.get('/events', getClubEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.post('/events/:id/poster', uploadEventPoster);

// User recruitment
router.post('/recruit', recruitUsers);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
