import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  listEvents,
  upcomingEvents,
  registerForEvent,
} from '../controllers/eventController.js';

const router = express.Router();

// Create a new event (Admin or authorized users)
router.post('/', auth, requireRole('admin'), createEvent);

// Get upcoming events (MUST be before /:id route)
router.get('/upcoming', upcomingEvents);

// List events with optional filters and pagination
router.get('/', listEvents);

// Update event by ID
router.put('/:id', auth, requireRole('admin'), updateEvent);

// Delete event by ID
router.delete('/:id', auth, requireRole('admin'), deleteEvent);

// Get event details by ID
router.get('/:id', getEvent);

// Register current user for an event by event ID
router.post('/:id/register', auth, registerForEvent);

export default router;
