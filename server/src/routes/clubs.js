import express from 'express';
import {
  createClub,
  updateClub,
  deleteClub,
  getClub,
  listClubs,
  clubEvents,
} from '../controllers/clubController.js';

const router = express.Router();

// TODO: Add authentication and admin authorization middleware as needed

// Create a new club (Admin only)
router.post('/', createClub);

// Update club details by ID (Admin only)
router.put('/:id', updateClub);

// Delete a club by ID (Admin only)
router.delete('/:id', deleteClub);

// Get club details by ID (public)
router.get('/:id', getClub);

// List clubs with pagination and optional search (public)
router.get('/', listClubs);

// Get events associated with a specific club (public)
router.get('/:id/events', clubEvents);

export default router;
