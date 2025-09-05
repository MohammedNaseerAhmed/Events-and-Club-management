import express from 'express';
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

// TODO: Protect routes with authentication and optionally admin authorization where needed

// Create a new event (Admin or authorized users)
router.post('/', createEvent);

// Get upcoming events (MUST be before /:id route)
router.get('/upcoming', upcomingEvents);

// List events with optional filters and pagination
router.get('/', listEvents);

// Update event by ID
router.put('/:id', updateEvent);

// Delete event by ID
router.delete('/:id', deleteEvent);

// Get event details by ID
router.get('/:id', getEvent);

// Register current user for an event by event ID
router.post('/:id/register', registerForEvent);

export default router;
