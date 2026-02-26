import express from 'express';
import { authenticate, ensureRole, ensureOrgHead, optionalAuth } from '../middleware/auth.js';
import { eventCreateValidator, eventUpdateValidator } from '../middleware/validators.js';
import {
    listPublicOrganizations, getOrganization,
    createEvent, listClubEvents, updateEvent, cancelEvent,
    listPublicEvents, getPublicEvent,
    registerForEvent, unregisterFromEvent, getAttendees, getMyRegistration, getMyRegistrations,
} from '../controllers/organizationController.js';

const router = express.Router();

// Public organization routes
router.get('/organizations', listPublicOrganizations);
router.get('/organizations/:id', getOrganization);

// Club Head creates event for their org
router.post('/clubs/:clubId/events', authenticate, ensureOrgHead('clubId'), eventCreateValidator, createEvent);
router.get('/clubs/:clubId/events', authenticate, ensureOrgHead('clubId'), listClubEvents);

// Event CRUD
router.patch('/events/:eventId', authenticate, eventUpdateValidator, updateEvent);
router.delete('/events/:eventId', authenticate, cancelEvent);

// Public event listing (approved only)
router.get('/events', optionalAuth, listPublicEvents);
router.get('/events/:eventId', optionalAuth, getPublicEvent);

// Registrations
router.post('/events/:eventId/register', authenticate, registerForEvent);
router.post('/events/:eventId/unregister', authenticate, unregisterFromEvent);
router.get('/events/:eventId/attendees', authenticate, ensureRole('admin', 'clubHead'), getAttendees);
router.get('/events/:eventId/my-registration', authenticate, getMyRegistration);
router.get('/my-registrations', authenticate, getMyRegistrations);

export default router;
