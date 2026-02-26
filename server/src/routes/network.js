import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { networkInviteValidator } from '../middleware/validators.js';
import { sendInvite, getInvitations, getConnections, acceptInvitation, rejectInvitation, getSuggestions } from '../controllers/networkController.js';

const router = express.Router();

router.post('/invite', authenticate, networkInviteValidator, sendInvite);
router.get('/invitations', authenticate, getInvitations);
router.get('/connections', authenticate, getConnections);
router.post('/invitations/:id/accept', authenticate, acceptInvitation);
router.post('/invitations/:id/reject', authenticate, rejectInvitation);
router.get('/suggestions', authenticate, getSuggestions);

export default router;
