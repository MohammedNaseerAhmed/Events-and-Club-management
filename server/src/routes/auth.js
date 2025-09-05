import express from 'express';
import { register, login, me, logout } from '../controllers/authController.js';
import { auth as protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/logout', logout); // optional, mostly frontend removes token

export default router;
