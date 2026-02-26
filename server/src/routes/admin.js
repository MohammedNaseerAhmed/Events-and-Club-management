import express from 'express';
import { authenticate, ensureRole } from '../middleware/auth.js';
import { organizationCreateValidator, organizationUpdateValidator } from '../middleware/validators.js';
import {
  createOrganization, listOrganizations, updateOrganization, deleteOrganization,
  assignHead, removeHead,
  getPendingEvents, getAllEvents, approveEvent, rejectEvent,
  listUsers, updateUserRole, deleteUser, getAuditLogs, getStats,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, ensureRole('admin'));

// Stats
router.get('/stats', getStats);

// Organizations
router.post('/organizations', organizationCreateValidator, createOrganization);
router.get('/organizations', listOrganizations);
router.patch('/organizations/:id', organizationUpdateValidator, updateOrganization);
router.delete('/organizations/:id', deleteOrganization);
router.post('/organizations/:id/assign-head', assignHead);
router.post('/organizations/:id/remove-head', removeHead);

// Events
router.get('/events', getAllEvents);
router.get('/events/pending', getPendingEvents);
router.post('/events/:eventId/approve', approveEvent);
router.post('/events/:eventId/reject', rejectEvent);

// Users
router.get('/users', listUsers);
router.patch('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

// Audit logs
router.get('/audit-logs', getAuditLogs);

export default router;
