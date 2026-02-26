import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  createClub,
  updateClub,
  deleteClub,
  getClub,
  listClubs,
  clubEvents,
} from '../controllers/clubController.js';

const router = express.Router();

// Create a new club (Admin only)
router.post('/', auth, requireRole('admin'), createClub);

// Update club details by ID (Admin only)
router.put('/:id', auth, requireRole('admin'), updateClub);

// Delete a club by ID (Admin only)
router.delete('/:id', auth, requireRole('admin'), deleteClub);

// Get club details by ID (public)
router.get('/:id', getClub);

// List clubs with pagination and optional search (public)
router.get('/', listClubs);

// Get events associated with a specific club (public)
router.get('/:id/events', clubEvents);

export default router;
