import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { profileUpdateValidator, passwordChangeValidator, privacyUpdateValidator, notificationSettingsValidator } from '../middleware/validators.js';
import {
    getUserProfile, updateProfile, changePassword, updatePrivacy,
    updateNotificationSettings, followOrg, unfollowOrg, deleteAccount, getMyRegistrations,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/me/registrations', authenticate, getMyRegistrations);
router.patch('/me', authenticate, profileUpdateValidator, updateProfile);
router.patch('/me/password', authenticate, passwordChangeValidator, changePassword);
router.patch('/me/privacy', authenticate, privacyUpdateValidator, updatePrivacy);
router.patch('/me/notifications', authenticate, notificationSettingsValidator, updateNotificationSettings);
router.post('/me/follow-org/:orgId', authenticate, followOrg);
router.delete('/me/follow-org/:orgId', authenticate, unfollowOrg);
router.delete('/me', authenticate, deleteAccount);
router.get('/:username', optionalAuth, getUserProfile);

export default router;
