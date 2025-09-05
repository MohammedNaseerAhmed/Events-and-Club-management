import express from 'express';
import { me, updateMe } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', auth, me);
router.put('/me', auth, updateMe);

export default router;
